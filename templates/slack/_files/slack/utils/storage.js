/**
  StdLib Storage Utility for Slack

  Using your StdLib Library Token, connect to `utils.storage` (key-value storage)
  and save team identity data (bot access token, etc.) for future reference.
*/

const lib = require('lib')({token: process.env.STDLIB_TOKEN});

function formatTeamKey(teamId) {
  return `SLACK::${process.env.SLACK_APP_NAME}::${teamId}`;
};

const CACHE = {};

module.exports = {
  setTeam: (teamId, value, callback) => {
    lib.utils.storage.set(formatTeamKey(teamId), value, (err, value) => {
      if (!err) {
        CACHE[teamId] = value;
      }
      callback(err, value);
    });
  },
  getTeam: (teamId, callback) => {
    if (CACHE[teamId]) {
      return callback(null, CACHE[teamId]);
    }
    lib.utils.storage.get(formatTeamKey(teamId), (err, value) => {
      if (!err) {
        CACHE[teamId] = value;
      }
      callback(err, value);
    });
  }
};
