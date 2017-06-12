/**
* MORE handler, responds if user texts "more"
*		(or any uppercase variation like "MORE")
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
			`This is the MORE handler for your Twilio Messaging Hub on StdLib`,
			``,
			`You can customize its behavior in /functions/messaging/more.js`
		].join('\n')
	);

};
