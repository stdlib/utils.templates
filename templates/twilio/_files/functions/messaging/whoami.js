/**
* WHOAMI handler, responds if user texts "whoami"
*		(or any uppercase variation like "WHOAMI")
* @param {string} tel The incoming telephone number
* @param {string} body The (text) body of the message
* @param {object} from Information about the incoming message: number, zip, city, state, country
* @param {object} to Information about the receiver (your Twilio number): number, zip, city, state, country
* @returns {string}
*/
module.exports = (tel = '', body = '', from = {}, to = {}, callback) => {

	callback(
		null,
		[
			`You are messaging from ${from.number} in ${from.city}, ${from.state} ${from.zip}, ${from.country}.`,
			'',
			'By default, Twilio provides information about incoming SMS and MMS ' +
				'messages and you can use them via StdLib'
		].join('\n')
	);

};
