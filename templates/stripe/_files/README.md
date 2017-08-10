# Your "Serverless" Stripe Store with StdLib

Welcome to your new "serverless" Stripe store using StdLib!

The goal of this project is to lower the barrier to entry to the Stripe
ecosystem: it's now easier than ever to include payment processing in
your applications with Stripe, and using StdLib's function-first
approach, you can now create web services and APIs without ever standing
up a server - deploy and forget.

This store does not require anything more than a StdLib account and a Stripe
account. Your product information is stored via
[Stripe's Relay offering](https://stripe.com/docs/api#products) and your
services are stood up and catalogued via
[StdLib's command line tools](https://github.com/stdlib/lib).

# Running "Serverless" Stripe Store

To test your Stripe Store locally, use the StdLib CLI `http` tools with:

```
$ lib http
```

This creates a local server running on `http://localhost:8170/<username>/<service>/`.
If you haven't yet set environment variables in `env.json`, you'll get a notification
to enter your Stripe credentials. Put your test credentials in `"local"` and `"dev"`.

## Adding Products to Your Store

To add products to your store, modify `./stripe/products.json` and put
product images in `./static/products/`.

To learn more about which parameters are supported in the product fields,
check out:

- https://stripe.com/docs/api#create_product
- https://stripe.com/docs/api#skus

Your products won't be immediately visible, you'll need to deploy your service
first.

## Deploying Your Service

Deploying your service will run a diff algorithm from `./stripe/scripts/updateProducts.js`
that inactivates old products and creates new ones from `./stripe/products.json`.
This is because SKUs and products must be unique, and you can not delete SKUs
if orders are still being processed on them.

### WARNING: IT IS ADVISED YOU USE A UNIQUE STRIPE ACCOUNT.

This process will potentially overwrite and inactivate old Stripe products
if you're using a current account, so it's suggested you avoid using an already
active Stripe account; best to create a new one.

To deploy your service, run:

```
$ lib up dev
```

You'll be able to access your (test and development environment) Stripe store
at `https://<username>.lib.id/<service>@dev/`.

To deploy your service to production, make sure your Stripe keys in `"release"`
under `env.json` are set correctly then run:

```
$ lib release
```

# More Information

## Directory Structure

Your StdLib store contains a few different folders, we'll go over these in order:

```
./functions/
./helpers/
./static/
./stripe/
./templates/
```

### Functions

The `./functions/` folder contains your StdLib functions. All files in this
directory are converted into infinitely scalable, "serverless" API endpoints.
To learn more about how `functions` work, check out
[StdLib on Github](https://github.com/stdlib/lib).

You can read the documentation in each of the files to see how they work,
but a summary is that `__notfound__.js` will handle any function (or HTTP)
paths matching the root path that doesn't have a corresponding function. In
this case, it's used to map `/static/` calls to the web service to the `./static/`
directory.

`__main__.js` is the main function handler, i.e. a service call with no associated
function name will hit this endpoint, and `order.js` is the `/order` endpoint.

### Helpers

Basic helpers for your StdLib functions that you don't want to exist in their own
endpoints should live here.

### Static

Files that you'd like your service to serve via the `/static/` endpoint
should be placed here. It's best to put product images in the `./static/products`
folder.

### Stripe

Your Stripe Store products are stored here in `./stripe/products.json`. The
script which runs on deploy to set and store your Stripe Products
(i.e. `$ lib up dev`) exists in `./stripe/scripts`.

# That's It!

Enjoy, and feel free to hack your Stripe Store however you'd wish! For more
information and other cool things you can build with StdLib, visit the
[StdLib Homepage](https://stdlib.com) or follow StdLib on Twitter,
[@StdLibHQ](https://twitter.com/StdLibHQ).
