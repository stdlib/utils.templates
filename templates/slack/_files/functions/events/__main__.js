const lib = require('lib')({token: process.env.STDLIB_TOKEN});

const getBotToken = require('../../helpers/get_bot_token.js');
const message = require('../../utils/message.js');

const EventCache = require('../../helpers/event_cache.js');
const Cache = new EventCache(60000);

/**
* Slack Event Handler:
*   This function receives events from Slack and dispatches
*   the appropriate handler. If an event has no subtype, it will invoke
*   /functions/events/TYPE.js or /functions/events/TYPE/__main__.js,
*   otherwise it will invoke /functions/events/TYPE/SUBTYPE.js.
*
*   You can test individual events from the command line with:
*     $ lib .events.TYPE.SUBTYPE [username] [channel] [text]
*
*   The "@bg params" line below tells StdLib that when this function is
*     invoked as a background function over HTTP it should just respond with
*     whatever parameters were passed in as a JSON object. (This handles
*     Slack's "challenge" parameter.)
*
* @bg params
* @returns {object}
*/
module.exports = (context, callback) => {

  let params = context.params;

  if (params.challenge) {
    return callback(null, {challenge: params.challenge});
  }

  let event = params.event || {};

  // Validate event from params
  if (!event || typeof event !== 'object') {
    return callback(new Error('Invalid event'));
  }

  // Dedupe any slash commands that come in via messages.channel that aren't registered
  if (event.text && event.text.startsWith('/')) {
    return callback(new Error('Ignoring slash commands invoked as messages'));
  }

  // Dedupe events from Slack's retry policy
  if (!Cache.add(event, params.event_id)) {
    return callback(new Error('Event duplication limit reached'));
  }

  let name = [event.type, event.subtype].filter(v => !!v).join('.');

  if (!name) {
    return callback(new Error('No event type provided'));
  }

  let user = event.user;
  let channel = event.channel || (event.item && event.item.channel) || 'general';
  let text = event.text || '';

  getBotToken(params.team_id, (err, botToken) => {

    if (err) {
      callback(err);
    }

    lib[`${context.service.identifier}.events.${name}`](
      {
        user: user,
        channel: channel,
        text: text,
        event: event,
        botToken: botToken
      },
      (err, result) => {
        if (err) {
          if (result && result.error && result.error.type === 'ClientError') {
            callback(err);
          } else {
            message(
              botToken,
              channel,
              {
                text: err.message
              },
              callback
            );
          }
        } else {
          message(
            botToken,
            channel,
            result,
            callback
          );
        }
      }
    );
  });

};
