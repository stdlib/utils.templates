const storage = require('../slack/utils/storage.js');

/**
* Fetches token from storage
* @param {String} teamId the id of the team as passed by Slack
* @param {Function} callback Callback returns error and token, null token means no team provided
*/
function getToken(teamId, callback) {

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

/**
* Takes teamId and calls Handler with appropriate token
* @param {Function} Handler the handler to execute
* @param {String} teamId the id of the team as passed by Slack
* @param {Object} kwargs the kwargs of the initial StdLib handler function
* @param {Function} callback Callback returns error and token, null token means no team provided
*/
function tokenize(Handler, teamId, kwargs, callback) {

  getToken(teamId, (err, token) => err ? callback(err) : Handler(token, kwargs, callback));

}

module.exports = tokenize;
