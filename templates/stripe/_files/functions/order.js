const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
* Creates a stripe order based on a Stripe Checkout token and specific product
*   skuId, optionally containing shippingInfo
* @param {string} skuId The id of the SKU the user wishes to order
* @param {object} stripeToken A Stripe token object returned from Stripe Checkout
* @param {object} shippingInfo Shipping information from Stripe Checkout
* @returns {object}
*/
module.exports = (skuId, stripeToken, shippingInfo = null, context, callback) => {

  let order = {
    currency: 'usd',
    items: [
      {
        type: 'sku',
        parent: skuId
      }
    ],
    email: stripeToken.email
  };

  if (shippingInfo && Object.keys(shippingInfo).length) {

    order.shipping = {
      name: shippingInfo.shipping_name,
      address: {
        line1: shippingInfo.shipping_address_line1,
        line2: shippingInfo.shipping_address_line2,
        city: shippingInfo.shipping_address_city,
        state: shippingInfo.shipping_address_state,
        country: shippingInfo.shipping_address_country_code,
        postal_code: shippingInfo.shipping_address_zip
      }
    };

  }

  stripe.orders.create(order, (err, result) => {

    if (err) {
      return callback(err);
    }

    stripe.orders.pay(result.id, {
      source: stripeToken.id
    }, (err, result) => {
      return callback(err, result);
    });

  });

};
