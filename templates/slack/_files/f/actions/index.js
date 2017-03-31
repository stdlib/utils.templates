/**
  Service Function: /actions
    Slack Actions (Interactive Messages) Response Handler

    Due to Slack's 3000ms timeout, this function returns an HTTP 200 OK
      (via callback(null, data)) response as quickly as possible to tell Slack
      you've received the action. It then sends an async webhooked request to
      StdLib to continue the operations of the bot.

    To use this endpoint with actions in your interactive messages, set the
      action's {name} parameter to be the same as the filename of an action
      handler in /slack/actions (minus the extension). This bot will then run
      the appropriate action handler when it receives a request.

    For more about interactive messages and how to respond to them, see Slack's
      documentation: https://api.slack.com/docs/message-buttons
*/

const lib = require('lib');

module.exports = (params, callback) => {

  let action;

  if (params.kwargs.payload) {

    try {
      action = JSON.parse(params.kwargs.payload);
    } catch (e) {
      return callback(null, {error: 'Could not parse action payload'});
    }

  } else {
    action = {
      channel: params.kwargs.channel,
      actions: [
        {
          name: params.kwargs.action
        }
      ]
    };
  }

  if (!action || !action.actions) {
    return callback(null, {error: 'No actions specified'});
  }

  // Format service name for router
  let service = params.service.replace(/\//gi, '.');
  service = service === '.' ? service : `${service}[@${params.env}].`;

  // Setting webhook: true allows for async handling by StdLib
  lib({webhook: true})[`${service}handler`](
    {
      token: action.token,
      team_id: action.team && action.team.id,
      channel: action.channel,
      action: action
    },
    (err, result) => {

      // Provide quick empty 200 OK. Text in the second argument here will
      // replace your message until this bot finishes processing it
      return callback(null, 'Working...');

    }
  );

};
