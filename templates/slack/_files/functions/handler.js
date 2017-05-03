/**
  Service Function: /handler
    Dispatches events to handlers (Messages, Commands)

    This function retrieves the team details for the event or command that
      originated the request to /events, and then dispatches the associated
      message or command handler.
*/

const tokenize = require('../helpers/tokenize.js');

const CommandHandler = require('../slack/handlers/command_handler.js');
const EventHandler = require('../slack/handlers/event_handler.js');
const ActionHandler = require('../slack/handlers/action_handler.js');

module.exports = (channel = '', team_id = '', event = null, command = null, action = null, context, callback) => {

  if (!channel) {
    return callback(new Error('No channel specified'));
  }

  if (event) {

    tokenize(EventHandler, team_id, context.params, callback);

  } else if (command) {

    tokenize(CommandHandler, team_id, context.params, callback);

  } else if (action) {

    tokenize(ActionHandler, team_id, context.params, callback);

  } else {

    return callback(new Error('No command, event, or action specified'));

  }

};
