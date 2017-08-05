const lib = require('lib')({token: process.env.STDLIB_TOKEN});

const getBotToken = require('../../helpers/get_bot_token.js');
const update = require('../../utils/update_message.js');

/**
 * Slack Actions (Interactive Messages) Response Handler
 *   This function receives actions (interactive messages) from Slack and
 *     dispatches the appropriate handler. You should use this function as the
 *     endpoint for all actions, and place action handlers in
 *     /functions/actions/NAME.js, where NAME is the name of your action.
 *   You can test from the command line using:
 *     lib .actions.NAME [username] [channel name]
 *
 *   For more about interactive messages and how to respond to them, see Slack's
 *     documentation: https://api.slack.com/docs/message-buttons
 *
 * @returns {object}
 */
module.exports = (context, callback) => {

  let params = context.params;
  let action;

  if (params.payload) {
    try {
      action = JSON.parse(params.payload);
    } catch (err) {
      return callback(err)
    }
  } else {
    // Local testing
    action = {
      channel: {
        id: params.channel,
        name: params.channel
      },
      actions: [
        {
          name: params.name,
          value: params.value
        }
      ],
      callback_id: params.callback_id,
      team: {},
      user: {
        id: params.user,
        name: params.user
      }
    };
  }

  if (!action.actions || !action.actions.length) {
    return callback(null, {error: 'No actions specified'});
  }

  let name = action.actions[0].name;

  getBotToken(action.team.id, (err, botToken) => {

    if (err) {
      callback(err);
    }

    lib[`${context.service.identifier}.actions.${name}`](
      {
        user: action.user.id,
        channel: action.channel.id,
        action: action,
        botToken: botToken
      },
      (err, result) => {
        if (err) {
          if (result && result.error && result.error.type === 'ClientError') {
            callback(err);
          } else {
            update(
              botToken,
              action.channel.id,
              action.message_ts,
              {
                text: err.message
              },
              callback
            );
          }
        } else {
          update(
            botToken,
            action.channel.id,
            action.message_ts,
            result,
            callback
          );
        }
      }
    );

  });

};
