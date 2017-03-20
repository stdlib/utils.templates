const fs = require('fs');
const path = require('path');
const handlers = fs.readdirSync(path.join(__dirname, '..', 'events'))
  .reduce((handlers, dir) => {
    handlers[dir] = require(path.join(__dirname, '..', 'events', dir, 'handler.js'));
    return handlers;
  }, {});

const message = require('../utils/message.js');

/**
* Handles Events from message.channels
* @param {String} token The bot token for the Slack App
* @param {Object} kwargs The keyword arguments passed to the main Handler
* @param {Function} callback Callback to execute upon completion, sends message
*/
function EventHandler(token, kwargs, callback) {

  let event = kwargs.event;

  if (!event.type) {
    return callback(new Error('No event type specified'));
  }

  let handler = handlers[event.type];

  if (!handler) {
    return callback(new Error(`No handler for event "${event.type}"`));
  }

  handler(token, event, event.text, (err, result) => {

    if (err) {
      return callback(err);
    }

    return message(token, event.channel, result, (err, result) => callback(err, result));

  });

}

module.exports = EventHandler;
