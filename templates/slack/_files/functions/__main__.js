const ejs = require('ejs');
const template = __dirname + '/../pages/index.ejs';

const ENV = {
  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID || '',
  SLACK_REDIRECT: process.env.SLACK_REDIRECT || '',
  SLACK_OAUTH_SCOPE: process.env.SLACK_OAUTH_SCOPE || ''
};

/**
* The "Add to Slack" landing page for your app.
*   To modify the template, check out /pages/index.ejs.
* @returns {buffer}
*/
module.exports = (callback) => {

  ejs.renderFile(template, ENV, {}, (err, response) => {
    callback(err, new Buffer(response || ''), {'Content-Type': 'text/html'});
  });

};
