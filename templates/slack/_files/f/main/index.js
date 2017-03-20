const ejs = require('ejs');
const template = __dirname + '/../../slack/pages/auth.ejs';

const ENV = {
  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID || '',
  SLACK_REDIRECT: process.env.SLACK_REDIRECT || '',
  SLACK_OAUTH_SCOPE: process.env.SLACK_OAUTH_SCOPE || ''
};

module.exports = (params, callback) => {

  ejs.renderFile(template, ENV, {}, (err, response) => callback(err, new Buffer(response || '')));

};
