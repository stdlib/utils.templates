const send = require('../helpers/send.js');

/**
* Begins a conversation with a specified telephone number
* @param {string} tel The telephone number to initiate messaging with
* @returns {object}
*/
module.exports = (tel, context, callback) => {

	send(
		tel,
		[
			`Welcome to your Twilio Messaging Hub on StdLib!`,
			'',
			`To get started, try sending MORE, WHOAMI, ask something of your choosing,` +
				` or you can even try sending a picture message!`,
			'',
			'To prevent future messages, please respond STOP at any time.'
		].join('\n'),
		null,
		(err, result) => {
			if (err) {
				return callback(err);
			}
			return callback(null, {status: 'sent', tel: tel});
		}
	);

};
