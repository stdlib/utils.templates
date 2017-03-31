/**
  COMMAND ROUTER
  ==============
  REQUIRED SCOPE: bot,commands,chat:write:bot,chat:write:user
  OPTIONAL SCOPE: files:write:user

  This will route your command to the appropriate named command in /commands
  If a command isn't recognized, it will execute a fallback

  Details on the {command} object can be found here:
    https://api.slack.com/slash-commands

  The {reply} function sent to command handlers can be used to reply to the
    webhook that Slack provides, text which will be auto-formatted or can be
    an object that follows the chat.postMessage specification listed here:
      https://api.slack.com/methods/chat.postMessage
*/

const fs = require('fs');
const path = require('path');
const handlers = fs.readdirSync(path.join(__dirname, '..', 'commands'))
  .reduce((handlers, filename) => {
    let name = filename.substr(0, filename.lastIndexOf('.js'));
    handlers[name] = require(path.join(__dirname, '..', 'commands', filename));
    return handlers;
  }, {});

const respond = require('../utils/respond.js');

/**
* Handles Commands as defined by Slash Commands
* @param {String} token The bot token for the Slack App
* @param {Object} kwargs The keyword arguments passed to the main Handler
* @param {Function} callback Callback to execute upon completion, sends message
*/
function CommandHandler(token, kwargs, callback) {

  let command = kwargs.command;

  // Provide send option that messages the channel via the response_url webhook
  let reply = respond.bind(null, command.response_url);

  let handler = handlers[command.name];

  if (!handler) {
    return reply(`No handler for command "${command.name}"`, (err, result) => callback(err, result));
  }

  handler(token, command, command.text, reply, (err, result) => {

    if (err) {
      return callback(err);
    }

    return reply(result, (err, result) => callback(err, result));

  });

}

module.exports = CommandHandler;
