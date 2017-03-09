/**
  Slack Command Response Utility

  Sends a message to a webhook from a Slack Slash command
  For full documentation see: https://api.slack.com/methods/chat.postMessage
*/

const request = require('request');
const formatMessage = require('./format_message.js');

module.exports = (url, text, callback) => {

  if (!text) {
    return callback(null, '');
  }

  // If no token, assume development
  if (!url) {
    console.log('Warning: No url provided for response');
    return callback(null, text);
  }

  let data = formatMessage(undefined, undefined, text);

  request.post({
    uri: url,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }, (err, result) => {

    if (err) {
      return callback(err);
    }

    if (result.body !== 'ok') {
      return callback(new Error(`Invalid Response from Slack: ${result.body}`));
    }

    callback(null, text);

  });

};
