/**
  SupportedEventTypesCache()
    Creates a cache of the events this service supports based on the directories
      and files in /slack/events

    This is to prevent unhandled events from reaching the handler, resulting in
      extra request and compute volume since events can be quite frequent.
*/

const fs = require('fs');
const path = require('path');

class SupportedEventTypesCache {

  constructor() {
    this.cache = this.findHandledEvents();
  }

  check(type, subtype) {
    return this.cache[type] && (!subtype || this.cache[type][subtype]);
  }

  findHandledEvents() {
    let eventsDirPath = path.join(__dirname, '..', '..', 'slack', 'events');
    return fs.readdirSync(eventsDirPath).reduce((handledEvents, filename) => {
      let eventHandlerDirPath = path.join(eventsDirPath, filename);
      if (
        fs.lstatSync(eventHandlerDirPath).isDirectory() &&
        fs.existsSync(path.join(eventHandlerDirPath, 'handler.js'))
      ) {
        handledEvents[filename] = this.findHandledEventSubtypes(eventHandlerDirPath);
      }
      return handledEvents;
    }, {});
  }

  findHandledEventSubtypes(eventHandlerDirPath) {
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
  }

}

module.exports = SupportedEventTypesCache;
