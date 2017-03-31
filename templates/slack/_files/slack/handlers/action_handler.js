/**
  ACTION ROUTER
  ==============

  This will route your action to the appropriate action handler in
  /actions based on the {name} parameter specified in the input action. It will
  then update the original message based on the return value of the handler.

  Details on actions and interactive messages can be found here:
    https://api.slack.com/docs/message-buttons

  If the return value of an action handler is a string, it will be
    auto-formatted. If it is an object, it must follow the chat.update
    specification listed here (the token, ts, and channel params will be
    attached by default): https://api.slack.com/methods/chat.update
*/

const lib = require('lib');
const fs = require('fs');
const path = require('path');
const handlers = fs.readdirSync(path.join(__dirname, '..', 'actions'))
  .reduce((handlers, filename) => {
    let name = filename.substr(0, filename.lastIndexOf('.js'));
    handlers[name] = require(path.join(__dirname, '..', 'actions', filename));
    return handlers;
  }, {});

const updateMessage = require('../utils/update_message.js');

function ActionHandler(token, kwargs, callback) {

  let action = kwargs.action;
  let selectedAction = action.actions[0];

  if (!selectedAction) {
    return callback(new Error('No selected option specified'));
  }

  let handler = handlers[selectedAction.name];

  if (!handler) {
    return callback(new Error(`No handler for action "${selectedAction.name}"`));
  }

  handler(token, action, (err, message) => {

    if (err) {
      return callback(err);
    }

    updateMessage(token, action.channel.id, action.message_ts, message, callback);

  });

}

module.exports = ActionHandler;
