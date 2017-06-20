const lib = require('lib')({token: process.env.STDLIB_TOKEN});
const request = require('request');
const send = require('../../helpers/send.js');

/**
* Main messaging (SMS/MMS) handler. Upon receiving a message, first check to
*		see if there's media (MMS), if so, invoke __notfound__ handler with a media
*		object, otherwise, check to see if message corresponds to a handler (more,
*		whoami), invoke that if possible, or invoke __notfound__ with raw contents
*		of message body.
* @param {string} Body The message contents
* @param {string} From The inbound number
* @param {string} FromZip The zip associated with inbound number
* @param {string} FromCity The city associated with inbound number
* @param {string} FromState The state associated with inbound number
* @param {string} FromCountry The country associated with inbound number
* @param {string} To The outbound number, i.e. your Twilio Number
* @param {string} ToZip The zip associated with outbound number
* @param {string} ToCity The city associated with outbound number
* @param {string} ToState The state associated with outbound number
* @param {string} ToCountry The country associated with outbound number
* @param {string} AccountSid The Twilio Account SID - sent from Twilio, used to verify webhook authenticity
* @returns {object}
*/
module.exports = (
	Body = '',
	From = '',
	FromZip = '',
	FromCity = '',
	FromState = '',
	FromCountry = '',
	To = '',
	ToZip = '',
	ToCity = '',
	ToState = '',
	ToCountry = '',
	AccountSid = '',
	context,
	callback
) => {

	if (context.service.environment !== 'local' && process.env.TWILIO_ACCOUNT_SID !== AccountSid) {
		return callback(new Error('Can only invoke from valid Twilio Webhook'));
	}

	// Create some developer-friendly to / from objects
	let from = {
		number: From,
		zip: FromZip,
		city: FromCity,
		state: FromState,
		country: FromCountry
	};

	let to = {
		number: To,
		zip: ToZip,
		city: ToCity,
		state: ToState,
		country: ToCountry
	};

	let numMedia = parseInt(context.params.NumMedia);

	if (numMedia > 0) {

		// If we receive an image (or other media), we want to retrieve it in code
		let url = context.params['MediaUrl' + (numMedia - 1)];
		send(
			from.number,
			`We've received your media, just hold on a second.`,
			to.number,
			(err, result) => {
				if (err) {
					return callback(err);
				}

				// Get the image from Twilio's URL
				request(
					{
						url: url,
						encoding: null,
						method: 'GET'
					},
					(err, response, body) => {

						if (err) {
							// We couldn't get the image
							return send(
								from.number,
								'Sorry, we had trouble processing the image you sent. Try again.',
								to.number,
								callback
							);
						}

						// We got the image, and send it as a buffer using the `media` param
						lib[`${context.service.identifier}.messaging.__notfound__`]({
							tel: from.number,
							media: body,
							from: from,
							to: to
						}, (err, result) => {
							let message = err ? err.message : result;
							send(
								from.number,
								message,
								to.number,
								callback
							);
						});

					}
				);

			}
		);

	} else {

		// No image, try to find a handler for the message, default to __notfound__
		let handler = Body.toLowerCase().trim().replace(/[^a-z0-9_-]/gi, '_');
		lib[`${context.service.identifier}.messaging.${handler}`]({
			tel: from.number,
			body: Body,
			from: from,
			to: to
		}, (err, result) => {
			let message = err ? err.message : result;
			send(
				from.number,
				message,
				to.number,
				callback
			);
		});

	}

};
