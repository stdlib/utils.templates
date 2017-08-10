const path = require('path');

// Read environment variables for running scripts from StdLib CLI
let name = process.env.NAME;
let environment = process.env.SUBTYPE;
let version = process.env.DATA_version;

let username = name.split('/')[0];
let servicename = name.split('/')[1];
let envString = environment === 'release' ? version : environment;

// Read environment variables to get Stripe access
const ENV = require(path.join(process.cwd(), 'env.json'));

if (!ENV[environment].STRIPE_SECRET_KEY) {
  console.error(`STRIPE_SECRET_KEY environment variable for ${envString} must be set.`);
  process.exit(1);
}

const stripe = require('stripe')(ENV[environment].STRIPE_SECRET_KEY);
const async = require('async');
const products = require('../products.json');

// Replace image paths that start with "." with the full path to the
//   StdLib service when it's uploaded
function setImageWebDirectory(imageUrl, webDirectory) {
  if (imageUrl && imageUrl.substr(0, 2) === './' && webDirectory) {
    return webDirectory.endsWith('/') ?
      webDirectory + imageUrl.substr(2) :
      webDirectory + imageUrl.substr(1);
  }
  return imageUrl;
}

// Set full local product configuration from ./stripe/products.json
//   This mainly sets unique keys for SKUs and gets attribute list for
//   parent products.
function readLocalProductConfig(products) {

  return Object.keys(products).reduce((products, name) => {
    let product = products[name];
    product.name = name;
    product.attributes = Array.from(
      new Set(
        product.skus.reduce((attributes, sku) => {
          let attrs = sku.attributes;
          let names = Object.keys(attrs);
          sku._key = names.sort().map(name => `${name}:${attrs[name]}`).join(',');
          return attributes.concat(names);
        }, [])
      )
    ).sort();
    product.skus = product.skus || [];
    return products;
  }, products);

};

// Based on the stripe "product list" endpoint:
//   https://stripe.com/docs/api#list_products
//   condenses config into same config from ./stripe/products.json
function readStripeProductConfig(stripeProducts) {

  return stripeProducts.reduce((products, product) => {
    products[product.name] = product;
    product.skus = ((product.skus && product.skus.data) || []).map(sku => {
      let attrs = sku.attributes;
      let names = Object.keys(attrs);
      sku._key = names.sort().map(name => `${name}:${attrs[name]}`).join(',');
      return sku;
    });
    return products;
  }, {});

}

// Creates a diff of remote products and local JSON configuration
//   This allows us to check which products need to be inactivated on Stripe,
//   updated with new information, or created.
//   We don't delete old SKUs / etc. because orders could still be processing.
function diffProductConfig(localConfig, stripeConfig, webDirectory) {

  let updates = Object.keys(stripeConfig).reduce((updates, name) => {
    let stripeProduct = stripeConfig[name];
    let localProduct = localConfig[name];
    let update = {
      id: stripeProduct.id,
      name: stripeProduct.name
    };
    if (!localProduct) {
      if (updates.active) {
        update.active = false;
        updates[name] = update;
      }
    } else {
      update = Object.keys(stripeProduct).reduce((update, key) => {
        if (key === 'skus' || !(key in localProduct)) {
          return update;
        } else if (key === 'images') {
          update[key] = localProduct[key].map(image => setImageWebDirectory(image, webDirectory));
        } else {
          update[key] = localProduct[key];
        }
        return update;
      }, update);
      let skuExists = {};
      let skuLookup = stripeProduct.skus.reduce((lookup, sku) => {
        skuExists[sku._key] = sku.id;
        if (sku.active) {
          lookup[sku._key] = {
            _key: sku._key,
            id: sku.id,
            _update: true,
            active: false
          };
        }
        return lookup;
      }, {});
      localProduct.skus.reduce((lookup, sku) => {
        if (skuExists[sku._key]) {
          sku.id = skuExists[sku._key];
          sku._update = true;
        }
        sku.active = 'active' in sku ? sku.active : true;
        sku.image = setImageWebDirectory(sku.image, webDirectory);
        lookup[sku._key] = sku;
        return lookup;
      }, skuLookup);
      update.skus = Object.keys(skuLookup).map(key => skuLookup[key]);
      updates[name] = update;
    }
    return updates;
  }, {});

  let additions = Object.keys(localConfig).reduce((additions, name) => {
    if (updates[name]) {
      return additions;
    }
    let product = localConfig[name];
    product.images && (
      product.images = product.images.map(image => setImageWebDirectory(image, webDirectory))
    );
    product.skus && product.skus.forEach(sku => {
      sku.image = setImageWebDirectory(sku.image);
    });
    additions[name] = product;
    return additions;
  }, {});

  return {
    updates: Object.keys(updates).map(key => updates[key]),
    additions: Object.keys(additions).map(key => additions[key])
  };

}

// Retrieves a list of Stripe products and associated SKUs (including inactive)
// using:
//    https://stripe.com/docs/api#list_products
// and:
//    https://stripe.com/docs/api#list_skus
// Then diffs them, and updates / creates products in Stripe accordingly
function updateProducts(webDirectory, callback) {

  console.log('Retrieving inventory...');

  stripe.products.list({}, (err, result) => {

    if (err) {
      return callback(new Error(`Could not retrieve old inventory: ${err.message}`));
    }

    let stripeProducts = result.data;

    async.parallel(
      stripeProducts.map(product => {
        return cb => {
          console.log(`Retrieving skus for "${product.name}"...`);
          stripe.skus.list({product: product.id}, cb);
        }
      }),
      (err, results) => {

        if (err) {
          return callback(err);
        }

        stripeProducts = stripeProducts.map((product, i) => {
          product.skus = results[i];
          return product;
        });

        let diff = diffProductConfig(
          readLocalProductConfig(products),
          readStripeProductConfig(stripeProducts),
          webDirectory
        );

        async.series(
          [].concat(
            diff.updates.map(product => {
              let productId = product.id;
              let skus = product.skus || [];
              delete product.id;
              delete product.skus;
              return productCB => {
                console.log(`Updating "${product.name}"...`);
                return stripe.products.update(productId, product, (err, result) => {
                  if (err) {
                    return productCB(err);
                  }
                  async.series(
                    skus.map(sku => {
                      let skuId = sku.id;
                      delete sku.id;
                      return skuCB => {
                        if (sku._update) {
                          console.log(`Updating "${product.name}" sku: ${sku._key}...`);
                          delete sku._update;
                          delete sku._key;
                          delete sku.id;
                          return stripe.skus.update(skuId, sku, skuCB);
                        }
                        sku.product = productId;
                        console.log(`Creating "${product.name}" sku: ${sku._key}...`);
                        delete sku._key;
                        return stripe.skus.create(sku, skuCB);
                      };
                    }),
                    productCB
                  )
                });
              };
            }),
            diff.additions.map(product => {
              let skus = product.skus || [];
              delete product.skus;
              return productCB => {
                console.log(`Creating product "${product.name}"...`);
                stripe.products.create(product, (err, result) => {
                  if (err) {
                    return productCB(err);
                  }
                  let productId = result.id;
                  async.series(
                    skus.map(sku => {
                      return skuCB => {
                        sku.product = productId;
                        console.log(`Creating "${product.name}" sku: ${sku._key}...`);
                        delete sku._key;
                        return stripe.skus.create(sku, skuCB);
                      };
                    }),
                    productCB
                  )
                });
              };
            })
          ),
          (err, results) => {
            if (err) {
              return callback(err);
            }
            return callback(null, results);
          }
        );

      }
    );

  });

};

// Execute, and set image url to the service that's about to be created.
updateProducts(
  `https://${username}.lib.id/${servicename}@${envString}/`,
  (err, results) => {
    if (err) {
      console.error(err);
      process.exit(1);
      return;
    }
    process.exit(0);
    return;
  }
);
