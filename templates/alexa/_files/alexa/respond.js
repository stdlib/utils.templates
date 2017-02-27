module.exports = {
  error: function (err, callback) {

    return this.say(`Error: ${err.message}`, callback);

  },
  say: function (body, callback) {

    callback(null, {
      version: 'dev',
      sessionAttributes: {},
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: body || 'invalid response'
        },
        shouldEndSession: true
      }
    });

  }
};
