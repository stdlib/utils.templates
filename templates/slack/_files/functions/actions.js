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

    You can test from the command line using:
      lib .actions --name ACTION --channel CHANNEL [--user USER --callback_id CALLBACK_ID --value VALUE --team_id TEAM_ID]

    For more about interactive messages and how to respond to them, see Slack's
      documentation: https://api.slack.com/docs/message-buttons
*/

const lib = require('lib');

/**
* Webhook for Slack Actions (Interactive Messages)
* @param {string} name Action Name (Local Testing)
* @param {string} value Action Value (Local Testing)
* @param {string} channel Channel Name (Local Testing)
* @param {string} callback_id Callback ID (Local Testing)
* @param {string} team_id Team ID (Local Testing)
* @param {string} user Username (Local Testing)
* @param {object} payload The payload for the action
* @returns {any}
*/
module.exports = (
  name = '',
  value = '',
  channel = 'general',
  callback_id = '',
  team_id = '',
  user = '',
  payload = null,
  context,
  callback
) => {

  let action = payload || {
    channel: channel,
    actions: [
      {
        name: name,
        value: value
      }
    ],
    callback_id: callback_id,
    team: {
      team_id: team_id
    },
    user: {
      name: user
    }
  };

  if (!action.actions) {
    return callback(null, {error: 'No actions specified'});
  }

  // Setting background: true allows for async handling by StdLib
  lib({background: true})[`${context.service.identifier}.handler`](
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
