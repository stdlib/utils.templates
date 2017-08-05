const lib = require('lib')({token: process.env.STDLIB_TOKEN});

const getBotToken = require('../../helpers/get_bot_token.js');
const respond = require('../../utils/respond.js');

/**
* Slack Slash Command Handler:
*   This function receives slash commands from Slack and dispatches
*   the appropriate handler. You should use this function as the endpoint
*   for all commands, and place commands in /functions/commands/NAME.js,
*   where NAME is the name of your command.
*
*   You can test individual slash commands from the command line with:
*     $ lib .commands.NAME [username] [channel] [text]
*
* @returns {object}
*/
module.exports = (context, callback) => {

  let command = context.params;

  if (!command.command) {
    return callback(new Error('No command specified'));
  }

  if (command.command[0] !== '/') {
    return callback(new Error('Commands must start with /'));
  }

  let name = command.command.substr(1);

  getBotToken(command.team_id, (err, botToken) => {

    if (err) {
      callback(err);
    }

    lib[`${context.service.identifier}.commands.${name}`](
      {
        user: command.user_id,
        channel: command.channel_id,
        text: command.text,
        command: command,
        botToken: botToken
      },
      (err, result) => {
        if (err) {
          respond(
            command.response_url,
            {
              response_type: 'ephemeral',
              text: err.message
            },
            callback
          );
        } else {
          respond(
            command.response_url,
            result,
            callback
          );
        }
      }
    );

  });

};
