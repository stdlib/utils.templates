/**
  Slack Update Message

  Updates a message specified by channel and ts
  For full documentation see: https://api.slack.com/methods/chat.update
*/

const request = require('request');
const formatMessage = require('./format_message.js');

module.exports = (token, channel, ts, message, callback) => {

  // If no token, assume development
  if (!token) {
    console.log('Warning: No token provided for message');
    return callback(null, message);
  }

  if (typeof message === 'string') {
    message = {
      text: message
    };
  }

  message.ts = ts;
  let data = formatMessage(token, channel, message);

  if (data.attachments) {
    data.attachments = JSON.stringify(data.attachments);
  }

  request.post({
    uri: 'https://slack.com/api/chat.update',
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
