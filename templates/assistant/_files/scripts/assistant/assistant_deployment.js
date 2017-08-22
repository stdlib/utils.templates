const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const inquirer = require('inquirer');
const chalk = require('chalk');

/** === StdLib Interface === **/
const lib = require('lib');
/** ======================== **/

/**
* AssistantDeployment is used to manage the command line interface for
*   authorization with Google Assistant via StdLib, as well as
*   assembling your actions into the expected Action Package
*   (https://developers.google.com/actions/reference/action-package)
*   creating the package with Google, previewing the package for testing,
*   and submitting the action for final deployment. It creates a temporary
*   credentials file, `assistant.json`, that *should not* be checked into
*   version control --- `.gitignore` and `.libignore` (Git and StdLib ignore
*   files, respectively) have been created for you.
*
*   Please note: This is meant to be run from StdLib scripts
*   (see stdlib: scripts in your `package.json`) around service deployment.
*
*   For more information about StdLib, visit https://stdlib.com or check
*   out the CLI tools on GitHub: https://github.com/stdlib/lib
*
* @class
*/
class AssistantDeployment {

  /**
  * Constructor class, sets necessary variables and handles process exceptions
  * @returns {AssistantDeployment}
  */
  constructor(env, version) {

    this._isComplete = false;
    this.authEndpoint = 'https://bots.stdlib.com/auth/assistant';
    process.on('exit', (code) => process.exit(this._isComplete ? code : 1));
    process.on('uncaughtException', (err) => this.error(err, true));

    this.pkg = require(path.join(process.cwd(), 'package.json'));
    this.assistant = this.pkg.stdlib.assistant || {};
    this.names = this.pkg.stdlib.name.split('/');
    this.endpoint = `https://${this.names[0]}.stdlib.com/${this.names[1]}@${env === 'release' ? version : env}/${this.names.slice(2).join('/')}`;
    this.voiceOptions = ['female_1', 'female_2', 'male_1', 'male_2'];
    this.defaultName = 'my assistant';
    this.defaultProjectId = `StdLib: ${this.pkg.stdlib.name}`;
    this.defaultLanguage = 'en-US';

    this.assistant.name = this.assistant.name || this.defaultName;
    this.assistant.voice = this.assistant.voice || this.voiceOptions[0];
    this.assistant.projectId = this.assistant.projectId || this.defaultProjectId;
    this.assistant.language = this.assistant.language || this.defaultLanguage;

    if (this.voiceOptions.indexOf(this.assistant.voice) === -1) {
      this.error(new Error(`Assistant Voice must be one of: ${this.voiceOptions.join(', ')}`));
    }

    this.auth = lib.bots.auth.assistant;
    this.deploy = lib.bots.deploy.assistant;

  }

  /**
  * Reads your Assistant Credentials from `assistant.json`
  * @returns {Object}
  */
  readAssistantCredentials() {
    try {
      return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assistant.json')) + '').credentials || {};
    } catch (e) {
      return {};
    }
  }

  /**
  * Reads your last created Assistant Action Package from `assistant.json`
  * @returns {Object}
  */
  readAssistantActionPackage() {
    try {
      return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assistant.json')) + '').actionPackage || {};
    } catch (e) {
      return {};
    }
  }

  /**
  * Writes new credentials to `assistant.json`
  * @param {Object} credentials Expected to contain "access_token" and "refresh_token"
  * @returns {Object}
  */
  writeAssistantCredentials(credentials) {
    return (fs.writeFileSync(
      path.join(process.cwd(), 'assistant.json'),
      JSON.stringify({
        credentials: credentials,
        actionPackage: this.readAssistantActionPackage()
      }, null, 2)
    )), credentials;
  }

  /**
  * Writes new Action Package data to `assistant.json`
  * @param {Object} actionPackage Expected to contain "name"
  * @returns {Object}
  */
  writeAssistantActionPackage(actionPackage) {
    return (fs.writeFileSync(
      path.join(process.cwd(), 'assistant.json'),
      JSON.stringify({
        credentials: this.readAssistantCredentials(),
        actionPackage: actionPackage
      }, null, 2)
    )), actionPackage;
  }

  /**
  * Updates credentials in `assistant.json`
  * @param {Object} credentials Expected to contain "access_token"
  * @returns {Object}
  */
  updateAssistantCredentials(credentials) {
    return this.writeAssistantCredentials(
      Object.keys(credentials).reduce(((oldCredentials, key) => {
        oldCredentials[key] = credentials[key];
        return oldCredentials;
      }), this.readAssistantCredentials())
    );
  }

  /**
  * Handles procedural errors (including uncaught exceptions)
  * @param {Error} err Error object to log details
  * @param {Boolean} debug Optional. Show stack trace (for uncaught exceptions)
  * @returns {undefined}
  */
  error(err, debug) {

    debug && console.error(err.stack);
    console.error(`${chalk.bold.red('Error: ')}${err.message}`);
    process.exit(1);

  }

  /**
  * Completes the running process without errors (signalCode: 0)
  * @returns {undefined}
  */
  complete() {

    this._isComplete = true;
    process.exit(0);

  }

  /**
  * Creates (requests) a new access token, either from previous refresh token
  *   or begins a new OAuth flow (expected to be used with command line)
  * @param {Function} callback Callback expecting (Error, accessToken)
  * @returns {undefined}
  */
  createAccessToken(callback) {

    let credentials = this.readAssistantCredentials();

    if (credentials.refresh_token) {
      return this.refreshAccessToken(credentials.refresh_token, callback);
    } else {
      return this.renewAccessToken(callback);
    }

  }

  /**
  * Refreshes access token from a refresh token
  * @param {String} refreshToken Your OAuth refresh_token
  * @param {Function} callback Callback expecting (Error, accessToken)
  * @returns {undefined}
  */
  refreshAccessToken(refreshToken, callback) {

    console.log('Verifying Google Assistant Credentials...');

    return this.auth({refresh: refreshToken}, (err, result) => {
      if (err) {
        return callback(err);
      }
      this.updateAssistantCredentials(result);
      return callback(null, result.access_token);
    });

  }

  /**
  * Renews access token by beginning a new OAuth flow, expected to be used
  *   with the command line
  * @param {Function} callback Callback expecting (Error, accessToken)
  * @returns {undefined}
  */
  renewAccessToken(callback) {

    console.log();
    console.log(`Welcome to your ${chalk.bold.green('Google Assistant Action')} on ${chalk.bold.green('StdLib')}!`);
    console.log();
    console.log(`Before we deploy ${chalk.bold.green(this.assistant.name)}, you\'ll need to visit the following page:`);
    console.log();
    console.log(chalk.underline(this.authEndpoint));
    console.log();
    console.log('This authorizes StdLib to deploy to Google Assistant on your behalf.');
    console.log('When complete, please enter the authorization code you receive.');
    console.log();

    inquirer.prompt([
      {
        name: 'code',
        message: 'Authorization Code:',
        type: 'input'
      }
    ]).then(data => {
      this.auth({generate: data.code}, (err, result) => {
        console.log();
        if (err) {
          return callback(err);
        }
        this.writeAssistantCredentials(result);
        return callback(null, result.access_token);
      });
    }).catch(err => callback(err));

  }

  /**
  * Creates an Action Package via Google OAuth. Please note that `this.deploy`
  *   is a shortcut method to `lib.bots.deploy.assistant`, see:
  *   https://bots.stdlib.com/deploy on StdLib for more details.
  * @param {String} accessToken Your OAuth Access Token
  * @param {Object} actionPackage Your actionPackage
  * @param {Function} callback Callback expecting (Error, actionPackage)
  * @returns {undefined}
  */
  createActionPackage(accessToken, actionPackage, callback) {

    console.log(`Creating Action Package for ${chalk.bold.green(this.assistant.name)}...`);

    this.deploy({
      token: accessToken,
      actionPackage: actionPackage
    }, (err, result) => {
      if (err) {
        callback(err);
      }
      this.writeAssistantActionPackage(result);
      callback(null, result);
    });

  }

  /**
  * Shortcut method to retrieve Access Token from `assistant.json`,
  *   intended to be used after `createAccessToken` has been called in a
  *   multi-step deployment process.
  * @returns {String} accessToken
  */
  getAccessToken() {

    return this.readAssistantCredentials().access_token;

  }

  /**
  * Shortcut method to retrieve Action Package from `assistant.json`,
  *   intended to be used after `createAccessToken` has been called in a
  *   multi-step deployment process. Simple alias of `readAssistantActionPackage`
  * @returns {Object} actionPackage
  */
  getActionPackage() {

    return this.readAssistantActionPackage();

  }

  /**
  * Prepares Action Package for preview. Please note that `this.deploy`
  *   is a shortcut method to `lib.bots.deploy.assistant`, see:
  *   https://bots.stdlib.com/deploy on StdLib for more details.
  * @param {String} accessToken Your OAuth Access Token
  * @param {String} actionPackage Your Action Package
  * @param {Function} callback Callback expecting (Error, actionPackage)
  * @returns {undefined}
  */
  previewActionPackage(accessToken, actionPackage, callback) {

    console.log(`Preparing ${chalk.bold.green(this.assistant.name)} for preview...`);

    this.deploy({
      token: accessToken,
      preview: actionPackage.name
    }, (err, result) => {
      if (err) {
        callback(err);
      }
      this.writeAssistantActionPackage(result);
      callback(null, result);
    });

  }

  /**
  * Simulates a conversation by sending a query to your currently previewed
  *   Google Assistant (your last deployed Action Package)
  * @param {String} accessToken Your OAuth Access Token
  * @param {String} query Your Request to Google Assisant
  * @param {Function} callback Callback expecting (Error, actionPackage)
  * @returns {undefined}
  */
  simulateConversation(accessToken, query, callback) {

    this.deploy({
      token: accessToken,
      query: query
    }, (err, result) => callback(err, result));

  }

  /**
  * Submits Action Package for final deployment. Please note that `this.deploy`
  *   is a shortcut method to `lib.bots.deploy.assistant`, see:
  *   https://bots.stdlib.com/deploy on StdLib for more details.
  * @param {String} accessToken Your OAuth Access Token
  * @param {String} actionPackage Your Action Package
  * @param {Function} callback Callback expecting (Error, actionPackage)
  * @returns {undefined}
  */
  submitActionPackage(accessToken, actionPackage, callback) {

    console.log(`Submitting ${chalk.bold.green(this.assistant.name)} for approval...`);

    this.deploy({
      token: accessToken,
      submit: actionPackage.name
    }, (err, result) => {
      if (err) {
        callback(err);
      }
      this.writeAssistantActionPackage(result);
      callback(null, result);
    });

  }

}

module.exports = AssistantDeployment;
