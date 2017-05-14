const storage = require('./storage.js');

/**
* Fetches token from storage
* @param {String} teamId the id of the team as passed by Slack
* @param {Function} callback Callback returns error and token, null token means no team provided
*/
module.exports = function getBotToken(teamId, callback) {

  if (!teamId) {
    return callback(null, null);
  }

  // Fetch the team details from StdLib Storage
  storage.getTeam(teamId, (err, team) => {

    if (err) {
      return callback(err);
    }

    let botToken = (team.bot || {}).bot_access_token;

    if (!botToken) {
      return callback(new Error('No Bot Token Specified'));
    }

    return callback(null, botToken);

  });

}
