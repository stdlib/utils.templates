/**
  Service Function: /events
    Generalized Slack Events and Commands Handler

    Due to Slack's 3000ms timeout, this function returns an HTTP 200 OK
      (via callback(null, data)) response as quickly as possible to tell Slack
      you've received the event. It then sends an async webhooked request to
      StdLib to continue the operations of the bot.
*/

const lib = require('lib');

const EventCache = require('./event_cache.js');
const Cache = new EventCache(60000);

module.exports = (params, callback) => {

  if (params.kwargs.challenge) {
    return callback(null, {challenge: params.kwargs.challenge});
  }

  let event = params.kwargs.event;

  if (typeof event === 'string') {

    // For ease-of-use CLI testing, if necessary
    event = {
      type: event,
      subtype: params.kwargs.subtype,
      text: params.kwargs.text,
      channel: params.kwargs.channel,
      user: params.kwargs.user
    };

  }

  if (!event) {
    return callback(null, {error: 'No event or command details specified'});
  }

  // Dedupe any slash commands that come in via messages.channel that aren't registered
  if (event.text && event.text.startsWith('/')) {
    return callback(null, {error: 'Ignoring slash commands invoked as messages'});
  }

  // Dedupe events from Slack's retry policy
  if (!Cache.add(event)) {
    return callback(null, {error: 'Event duplication limit reached'});
  }

  // Format service name for router
  let service = params.service.replace(/\//gi, '.');
  service = service === '.' ? service : `${service}[@${params.env}].`;

  // Setting webhook: true allows for async handling by StdLib
  lib({webhook: true})[`${service}handler`](
    {
      token: params.kwargs.token,
      team_id: params.kwargs.team_id,
      channel: event.channel,
      event: event
    },
    (err, result) => {

      return callback(null, {ok: true});

    }
  );

};
