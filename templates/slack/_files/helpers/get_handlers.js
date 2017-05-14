const fs = require('fs');
const path = require('path');

/**
* Retrieves all handlers with a specified name
*/
module.exports = function getHandlers(name) {
  fs.readdirSync(path.join(__dirname, '..', 'slack', name))
    .reduce((handlers, filename) => {
      let id = filename;
      if (filename.endsWith('.js')) {
        id = id.substr(0, id.lastIndexOf('.js'));
        handlers[id] = require(path.join(__dirname, '..', 'slack', name, filename);
      } else {
        handlers[id] = require(path.join(__dirname, '..', 'slack', name, filename, 'handler.js'));
      }
      return handlers;
    }, {});
};

/**
* Fetches token from storage
* @param {String} teamId the id of the team as passed by Slack
* @param {Function} callback Callback returns error and token, null token means no team provided
*/
module.exports = function getToken(teamId, callback) {

  if (!teamId) {
    return callback(null, null);
  }

  // Fetch the team details from StdLib Storage
  storage.getTeam(teamId, (err, team) => {

    if (err) {
      return callback(err);
    }

    let token = (team.bot || {}).bot_access_token;

    if (!token) {
      return callback(new Error('No Bot Token Specified'));
    }

    return callback(null, token);

  });

}
