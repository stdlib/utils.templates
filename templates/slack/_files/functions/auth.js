const lib = require('lib')({token: process.env.STDLIB_TOKEN});
const request = require('request')
const async = require('async');
const ejs = require('ejs');

const storage = require('../helpers/storage.js');

const template = __dirname + '/../pages/auth.ejs';

/**
* Authorization HTML page to grant Slack App OAuth Permission
*   To modify the template, check out /pages/auth.ejs.
* @param {string} code Slack-provided authorization code
* @param {string} error Slack-provided error
* @returns {any}
*/
module.exports = (code = null, error = '', callback) => {

  if (!code) {
    return ejs.renderFile(template, {
      message: 'Failure',
      content: error || 'No auth code given. Try again?'
    }, {}, (err, response) => {
      callback(err, new Buffer(response || ''), {'Content-Type': 'text/html'});
    });
  }

  async.auto(
    {
      auth: (callback) => {
        //post code, app ID, and app secret, to get token
        let authAddress = 'https://slack.com/api/oauth.access?'
        authAddress += 'client_id=' + process.env.SLACK_CLIENT_ID
        authAddress += '&client_secret=' + process.env.SLACK_CLIENT_SECRET
        authAddress += '&code=' + code
        authAddress += '&redirect_uri=' + process.env.SLACK_REDIRECT;

        request.get(authAddress, function (error, response, body) {

          if (error) {
            return callback(error);
          }

          let auth;

          try {
            auth = JSON.parse(body);
          } catch(e) {
            return callback(new Error('Could not parse auth'));
          }

          if (!auth.ok) {
            return callback(new Error(auth.error));
          }

          callback(null, auth);

        });
      },
      identity: ['auth', (results, callback) => {

        let auth = (results || {}).auth || {};
        let url = 'https://slack.com/api/auth.test?'
        url += 'token=' + auth.access_token

        request.get(url, (error, response, body) => {

          if (error) {
            return callback(error);
          }

          try {
            identity = JSON.parse(body);

            let team = {
              id: identity.team_id,
              identity: identity,
              auth: auth,
              createdBy: identity.user_id,
              url: identity.url,
              name: identity.team
            };

            return callback(null, identity);
          } catch(e) {
            return callback(e);
          }

        });

      }],
      team: ['identity', (results, callback) => {

        let auth = (results || {}).auth || {};
        let identity = (results || {}).identity || {};
        let scopes = auth.scope.split(/\,/);

        team = {
          id: identity.team_id,
          identity: identity,
          bot: auth.bot,
          auth: auth,
          createdBy: identity.user_id,
          url: identity.url,
          name: identity.team,
          access_token: auth.access_token
        }

        storage.setTeam(team.id, team, (err, id) => {
          if (err) {
            return callback(err);
          }
          return callback(null, team);
        });

      }]
    },
    (err, results) => {
      if (err) return ejs.renderFile(template, {
        message: 'Failure',
        content: err && err.message
      }, {}, (err, response) => callback(err, new Buffer(response || ''), {'Content-Type': 'text/html'}));

      ejs.renderFile(template, {
        message: 'Success!',
        content: 'You can now invite the bot to your channels and use it!'
      }, {}, (err, response) => callback(err, new Buffer(response || ''), {'Content-Type': 'text/html'}));
    }
  );

};
