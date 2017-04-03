/**
  Service Function: /handler
    Dispatches events to handlers (Messages, Commands)

    This function retrieves the team details for the event or command that
      originated the request to /events, and then dispatches the associated
      message or command handler.
*/

const tokenize = require('./tokenize.js');

const CommandHandler = require('../../slack/handlers/command_handler.js');
const EventHandler = require('../../slack/handlers/event_handler.js');
const ActionHandler = require('../../slack/handlers/action_handler.js');

module.exports = (params, callback) => {

  let kwargs = params.kwargs;
  let teamId = kwargs.team_id;
  let channel = kwargs.channel;

  if (!channel) {
    return callback(new Error('No channel specified'));
  }

  let event = kwargs.event;
  let command = kwargs.command;
  let action = kwargs.action;

  if (event) {

    tokenize(EventHandler, teamId, kwargs, callback);

  } else if (command) {

    tokenize(CommandHandler, teamId, kwargs, callback);

  } else if (action) {

    tokenize(ActionHandler, teamId, kwargs, callback);

  } else {

    return callback(new Error('No command, event, or action specified'));

  }

};
