/**
  Service Function: /handler
    Dispatches events to handlers (Messages, Commands)

    This function retrieves the team details for the event or command that
      originated the request to /events, and then dispatches the associated
      message or command handler.

    You can test from the command line using:
      Event (Message)
        lib .handler --event EVENT --subtype SUBTYPE --text TEXT --channel CHANNEL [--user USER]
      Command
        lib .handler --command COMMAND --text TEXT --channel CHANNEL [--user USER]
*/

const tokenize = require('./tokenize.js');

const CommandHandler = require('../../slack/handlers/command_handler.js');
const EventHandler = require('../../slack/handlers/event_handler.js');
const ActionHandler = require('../../slack/handlers/action_handler.js');

const fs = require('fs');
const path = require('path');

const findHandledEvents = function() {
  let eventsDirPath = path.join(__dirname, '..', '..', 'slack', 'events');
  return fs.readdirSync(eventsDirPath).reduce((handledEvents, filename) => {
    let eventHandlerDirPath = path.join(eventsDirPath, filename);
    if (
      fs.lstatSync(eventHandlerDirPath).isDirectory() &&
      fs.existsSync(path.join(eventHandlerDirPath, 'handler.js'))
    ) {
      handledEvents[filename] = findHandledEventSubtypes(eventHandlerDirPath);
    }
    return handledEvents;
  }, {});
};

const findHandledEventSubtypes = function(eventHandlerDirPath) {
  let subtypesDirPath = path.join(eventHandlerDirPath, 'subtypes');
  if (fs.existsSync(subtypesDirPath) && fs.lstatSync(subtypesDirPath).isDirectory()) {
    return fs.readdirSync(subtypesDirPath).reduce((handledSubtypes, filename) => {
      let name = filename.substr(0, filename.lastIndexOf('.js'));
      handledSubtypes[name] = true;
      return handledSubtypes;
    }, {});
  } else {
    return {};
  }
};

const handledEvents = findHandledEvents();

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

    if (
      !handledEvents[event.type] ||
      (event.subtype && !handledEvents[event.type][event.subtype])
    ) {
      return callback(null, null);
    }

    tokenize(EventHandler, teamId, kwargs, callback);

  } else if (command) {

    tokenize(CommandHandler, teamId, kwargs, callback);

  } else if (action) {

    tokenize(ActionHandler, teamId, kwargs, callback);

  } else {

    return callback(new Error('No command, event, or action specified'));

  }

};
