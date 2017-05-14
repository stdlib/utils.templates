/**
  Slack Upload Utility

  Uploads a file as your bot user, provided the appropriate bot token.
  For full documentation see: https://api.slack.com/methods/files.upload
*/

const request = require('request');

module.exports = (token, channel, filename, contentType, file, callback) => {

  // If no token, assume development
  if (!token) {
    console.log('Warning: No token provided for upload');
    return callback(null, file);
  }

  request.post({
    uri: 'https://slack.com/api/files.upload',
    formData: {
      token: token,
      file: {
        value: file,
        options: {
          filename: filename,
          contentType: contentType
        }
      },
      filename: filename,
      channels: channel
    },
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

    callback(null, file);

  });

};
