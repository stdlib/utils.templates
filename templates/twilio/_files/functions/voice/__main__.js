const twilio = require('twilio');
const ForwardTo = process.env.CALL_FORWARD_NUMBER;

/**
* Main voice handler. Upon receiving a call, outputs a TwiML response
*   to handle call routing. Default is to forward the call to a number of
*   your choosing, to be used for call forwarding from a help line, for example.
*
*   See https://www.twilio.com/docs/api/twiml/dial for more information.
*
* @param {string} From The number that's calling (inbound)
* @param {string} AccountSid The Twilio Account SID - sent from Twilio, used to verify webhook authenticity
* @returns {buffer} XML (TwiML) information
*/
module.exports = (From = '', AccountSid = '', context, callback) => {

  if (context.service.environment !== 'local' && process.env.TWILIO_ACCOUNT_SID !== AccountSid) {
		return callback(new Error('Can only invoke from valid Twilio Webhook'));
	}

  let response = new twilio.twiml.VoiceResponse();
  response.dial({callerId: process.env.TWILIO_NUMBER}, ForwardTo);

  callback(null, Buffer.from(response.toString()), {'Content-Type': 'application/xml'});

};
