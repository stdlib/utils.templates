const fs = require('fs');
const readline = require('readline');
const spawn = require('child_process').spawn;
const chalk = require('chalk');
const AssistantDeployment = require('./assistant_deployment.js');

/**
* Used to simulate conversations with your Assistant Action via the command
*   line, plays audio via command line with afplay when available.
*
*   Use --silence or -s to prevent audio, and --debug or -d to show debug
*   data from requests.
* @class
*/
class AssistantSimulation {

  /**
  * Optionally pass in names for conversation
  * @param {String} name Your name
  * @param {String} assistantName the name of the Google Assisant
  * @return {AssistantSimulation}
  */
  constructor(name, assistantName) {

    this.deployment = new AssistantDeployment();
    this.accessToken = this.deployment.getAccessToken();

    this.name = name || this.deployment.pkg.author;
    this.displayName = this.name.substr(0, this.name.indexOf('<') - 1);
    this.displayNameColor = 'blue';
    this.assistantName = assistantName || this.deployment.assistant.name;
    this.assistantDisplayName = `Assistant: ${this.assistantName}`;
    this.assistantNameColor = 'green';
    this.endPhrases = ['close', 'bye', 'exit', 'quit', 'q'];
    this.debugWords = ['-d', '--debug'];
    this.animations = [
      chalk.bold.grey('Waiting (') + chalk.bold.cyan('⋅     ') + chalk.bold.grey(')'),
      chalk.bold.grey('Waiting (') + chalk.bold.cyan('•⋅    ') + chalk.bold.grey(')'),
      chalk.bold.grey('Waiting (') + chalk.bold.cyan('⋅•⋅   ') + chalk.bold.grey(')'),
      chalk.bold.grey('Waiting (') + chalk.bold.cyan(' ⋅•⋅  ') + chalk.bold.grey(')'),
      chalk.bold.grey('Waiting (') + chalk.bold.cyan('  ⋅•⋅ ') + chalk.bold.grey(')'),
      chalk.bold.grey('Waiting (') + chalk.bold.cyan('   ⋅•⋅') + chalk.bold.grey(')'),
      chalk.bold.grey('Waiting (') + chalk.bold.cyan('    ⋅•') + chalk.bold.grey(')'),
      chalk.bold.grey('Waiting (') + chalk.bold.cyan('     ⋅') + chalk.bold.grey(')')
    ];
    this._debug = false;
    this._silent = false;
    this._started = false;
    this._waitInterval = null;
    this.history = [];
    this.historyIndex = 0;

  }

  /**
  * Turns on debug mode
  * @return {Boolean} true
  */
  debug() {
    return (this._debug = true);
  }

  /**
  * Turns on debug mode
  * @return {Boolean} true
  */
  silence() {
    return (this._silent = true);
  }

  /**
  * Begins the simulation
  * @return {undefined}
  */
  start() {

    if (this._started) {
      throw new Error('Simulation already started');
    }

    this._started = true;

    console.log();
    console.log(chalk.bold('Welcome to the conversation simulator for your Assistant Action.'));
    console.log(`This simulator is powered by ${chalk.bold.green('StdLib')} and ${chalk.bold.green('Google')}.`);
    console.log();
    console.log('You can also visit the web simulator:');
    console.log(chalk.underline('https://developers.google.com/actions/tools/web-simulator'));
    console.log();

    if (!this.accessToken) {
      console.log(`To get started, make sure you've deployed your Assistant Action before.`);
      console.log(`Type the following to deploy to a development environment:`);
      console.log();
      console.log(chalk.bold('lib up dev'));
      console.log();
      return this.end(true);
    }

    console.log(`Your assistant name is ${chalk.bold.green(this.assistantName)}, you can try activating it with:`);
    console.log(chalk.grey(`  "Tell ${this.assistantName} to do something"`));
    console.log(chalk.grey(`  "Tell ${this.assistantName} my name is ${this.displayName}"`));
    console.log(chalk.grey(`  "Ask ${this.assistantName} for a recipe"`));
    console.log();

    console.log(chalk.bold.green('Happy simulating!'));
    console.log();

    this.input();

  }

  /**
  * Ends the Simulation
  * @param {Boolean} ignoreMessage Set to true to prevent saying "Goodbye!"
  * @return {undefined}
  */
  end(ignoreMessage) {

    if (!this._started) {
      throw new Error('Simulation not yet started!');
    }

    if (!ignoreMessage) {
      console.log();
      console.log(chalk.bold.red('Goodbye!'));
      console.log();
    }
    process.exit(0);

  }

  /**
  * Formats names for Terminal chat messages
  * @param {String} name
  * @param {String} color chalk color to use
  * @return {String}
  */
  formatName(name, color) {
    return `${chalk.bold.grey('[')}${chalk.bold[color](name)}${chalk.bold.grey(']')} `;
  }

  /**
  * Clears current process.stdout line, optionally writes String
  * @param {String} str
  * @return {undefined}
  */
  resetLine(str) {
    str || process.stdout.clearLine();
    process.stdout.cursorTo(0);
    str && process.stdout.write(str);
  }

  /**
  * Begins a waiting indicator (animated in this.animations)
  * @return {undefined}
  */
  startWait() {
    if (this._waitInterval) {
      return;
    }
    let i = 0;
    this._waitInterval = setInterval(() => {
      this.resetLine(this.animations.length ? this.animations[i++ % this.animations.length] : null);
    }, 100);
  }

  /**
  * Ends waiting indicator
  * @return {undefined}
  */
  endWait() {
    if (!this._waitInterval) {
      return;
    }
    clearInterval(this._waitInterval);
    this._waitInterval = null;
    this.resetLine();
  }

  /**
  * Plays audio file from base64-encoded MP3 in terminal with `afplay`
  *   will silently fail if there's an error
  * @param {String} b64data Base64-encoded raw MP3 data
  * @return {undefined}
  */
  playAudio(b64data) {

    if (!b64data) {
      return;
    }

    let filename = '/tmp/' + new Date().valueOf() + '-assistant-conversation.mp3';
    fs.writeFileSync(filename, new Buffer(b64data, 'base64'));
    let command = spawn(
      'afplay',
      [filename],
      {
        stdio: [null, null, null],
      }
    );
    command.on('exit', (code) => fs.unlinkSync(filename));

  }

  /**
  * Requests chat input from user, also handles all subsequent chat flow.
  *   Recursively calls itself on completion.
  * @return {undefined}
  */
  input() {

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(this.formatName(this.displayName, 'blue'), (query) => {

      rl.close();

      let debug = false;
      query = (query || '').trim();
      for (let i = 0; i < this.debugWords.length; i++) {
        let word = this.debugWords[i];
        if (query.endsWith(word)) {
          debug = true;
          query = query.substr(0, query.length - word.length).trim();
          break;
        }
      }

      if (!query) {
        return this.input();
      } else if (this.endPhrases.indexOf(query) !== -1) {
        return this.end();
      }

      this.startWait();

      this.deployment.simulateConversation(
        this.accessToken,
        query.trim(),
        (err, result) => {

          this.endWait();

          if (err) {
            console.log(chalk.bold.red('Error: ') + err.message);
          } else {
            console.log(
              result.response.trim()
                .split('\n')
                .map(line => this.formatName(this.assistantDisplayName, 'green') + line)
                .join('\n')
            );
            let audioResponse = result.audioResponse;
            result.audioResponse = audioResponse ? '[trimmed for debugging]' : undefined;
            (debug || this._debug) && console.log(JSON.stringify(result, null, 2));
            this._silent || this.playAudio(audioResponse);
          }

          this.input();

        }
      );

    });

  }

}

module.exports = AssistantSimulation;
