const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ejs = require('ejs');
const templatePath = __dirname + '/../templates/index.ejs';

// Render your index.ejs template
function render(err, result, context, callback) {

  return ejs.renderFile(
    templatePath,
    {
      error: err ? err.message : '',
      products: err ? [] : result.data,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      servicePath: context.service.identifier,
    },
    {},
    (err, response) => callback(err, new Buffer(response || ''), {'Content-Type': 'text/html'})
  );

};

/**
* Renders your Stripe Store by getting a list of active products and sending
*   them to the template in `./templates/index.ejs` to render
* @returns {buffer}
*/
module.exports = (context, callback) => {

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLISHABLE_KEY) {
    return render(
      new Error('Environment variables STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY must be set.'),
      [],
      context,
      callback
    );
  }

  stripe.products.list({active: true}, (err, result) => render(err, result, context, callback));

};
