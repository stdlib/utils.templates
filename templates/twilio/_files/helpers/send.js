const twilio = require('twilio');
const twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
* Send an SMS message via Twilio
* @param {string} to Who you're saying hello to
* @param {string} body Who you're saying hello to
* @returns {object}
*/
module.exports = (to, body, from = null, callback) => {

  from = from || process.env.TWILIO_NUMBER;

	twilioClient.messages.create({
    to: to,
    body: body,
	  from: from
	}, (err, message) => {
    if (err) {
      return callback(err);
    }
	  callback(err, {status: message.status});
	});

};
