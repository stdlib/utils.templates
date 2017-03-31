/**
  MESSAGE ROUTER
  ==============
  REQUIRED SCOPE: bot,channels.history,chat:write:bot,chat:write:user
  OPTIONAL SCOPE: files:write:user

  This will route channel messages to their appropriate subtype
  If no subtype is provided, this is also the handler for generic channel messages

  A list of subtypes and details on the {event} object can be found at:
    https://api.slack.com/events/message

  The resultant callback used /slack/utils/message.js to send, you can send
    text which will be auto-formatted or an object that follow the
    chat.postMessage specification listed here:
      https://api.slack.com/methods/chat.postMessage
*/

const fs = require('fs');
const path = require('path');
const subtypes = fs.existsSync(path.join(__dirname, 'subtypes')) &&
  fs.lstatSync(path.join(__dirname, 'subtypes')).isDirectory() &&
  fs.readdirSync(path.join(__dirname, 'subtypes'))
    .reduce((subtypes, filename) => {
      let name = filename.substr(0, filename.lastIndexOf('.js'));
      subtypes[name] = require(path.join(__dirname, 'subtypes', filename));
      return subtypes;
    }, {});

/**
* @param {String} token The bot token for the Slack App
* @param {Object} event The event data as passed from Slack
* @param {String} text Shortcut to event.text
* @param {Function} callback Callback to execute upon completion, sends message
*/
function MessageEventHandler(token, event, text, callback) {

  // Handle subtype if available, otherwise do nothing
  if (event.subtype) {

    return subtypes[event.subtype] ? subtypes[event.subtype](token, event, text, callback) : callback();

  }

  // Otherwise, handle as a plain message
  if (!text) {
    return callback(new Error('No message data'));
  }

  if (!text.match(/hi|hello|sup|hey/)) {
    return callback(new Error('Command not recognized'));
  }

  return callback(null, `Hey there! <@${event.user}> said ${text}`);

};

module.exports = MessageEventHandler;
