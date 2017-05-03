/**
  Service Function: /events
    Generalized Slack Events and Commands Handler

    Due to Slack's 3000ms timeout, this function returns an HTTP 200 OK
      (via callback(null, data)) response as quickly as possible to tell Slack
      you've received the event. It then sends an async webhooked request to
      StdLib to continue the operations of the bot.

    You can test from the command line using:
      lib .events --type EVENT --subtype SUBTYPE --text TEXT --channel CHANNEL [--user USER]
*/

const lib = require('lib');

const EventCache = require('../helpers/event_cache.js');
const Cache = new EventCache(60000);

/**
* @returns {object}
*/
module.exports = (
  type = '',
  subtype = '',
  text = '',
  channel = 'general',
  user = '',
  challenge = '',
  event = null,
  context,
  callback
) => {

  if (challenge) {
    return callback(null, {challenge: challenge});
  }

  event = event || {
    type: type,
    subtype: subtype,
    text: text,
    channel: channel,
    user: user
  };

  // Dedupe any slash commands that come in via messages.channel that aren't registered
  if (event.text && event.text.startsWith('/')) {
    return callback(null, {error: 'Ignoring slash commands invoked as messages'});
  }

  // Dedupe events from Slack's retry policy
  if (!Cache.add(event)) {
    return callback(null, {error: 'Event duplication limit reached'});
  }

  // Setting background: true allows for async handling by StdLib
  lib({background: true})[`${context.service.identifier}.handler`](
    {
      token: context.params.token,
      team_id: context.params.team_id,
      channel: event.channel,
      event: event
    },
    (err, result) => {

      return callback(null, {ok: true});

    }
  );

};
