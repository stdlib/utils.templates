/**
  Slack Message Utility

  Sends a message as your bot user, provided the appropriate bot token.
  For full documentation see: https://api.slack.com/methods/chat.postMessage
*/

const request = require('request');
const formatMessage = require('./format_message.js');

module.exports = (token, channel, text, callback) => {

  let data = formatMessage(token, channel, text);

  if (!text) {
    return callback(null, data);
  }

  // If no token, assume development
  if (!token) {
    console.log('Warning: No token provided for message');
    return callback(null, data);
  }

  if (data.attachments) {
    data.attachments = JSON.stringify(data.attachments);
  }

  request.post({
    uri: 'https://slack.com/api/chat.postMessage',
    form: data
  }, (err, result) => {

    if (err) {
      return callback(err);
    }

    let body;
    try {
      body = JSON.parse(result.body);
    } catch (e) {
      body = {}
    }

    if (!body.ok) {
      return callback(new Error(body.error ? `Slack Error: ${body.error}` : 'Invalid JSON Response from Slack'));
    }

    callback(null, data);

  });

};
