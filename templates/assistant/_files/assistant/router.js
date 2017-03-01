const fs = require('fs');
const path = require('path');

class Router {

  constructor(pathname) {
    this._actions = {};
    this.pathname = path.join(process.cwd(), pathname);
  }

  parseObject(value) {
    value = value || {};
    value = typeof value === 'object' ? value : {};
    return value;
  }

  parseArray(value) {
    value = value || [];
    value = value instanceof Array ? value : [];
    return value;
  }

  parseUser(user) {
    let u = this.parseObject(user);
    return {
      id: u.user_id || null
    };
  }

  parseConversation(conversation) {
    let c = this.parseObject(conversation);
    return {
      id: c.conversation_id || null,
      type: c.type || null
    };
  }

  parseAssistantArguments(args) {

    args = args.reduce((args, arg) => {
      args[arg.name] = {
        value: arg.text_value.replace(/ ' /gi, '\''),
        raw_text: arg.raw_text.replace(/ ' /gi, '\'')
      };
      return args;
    }, {});

    args.trigger_query = args.trigger_query || {value: '', raw_text: ''};

    return args;

  }

  parseCLIArguments(args) {

    args = Object.keys(args).reduce((a, key) => {
      a[key] = {value: args[key], raw_text: args[key]};
      return a;
    }, {});

    args.trigger_query = args.trigger_query || {value: '', raw_text: ''};

    return args;

  }

  parseInput(input, intent, args) {
    let i = this.parseObject(input);
    i.intent = intent || i.intent || '__main__';
    i.intent = i.intent === 'assistant.intent.action.MAIN' ? '__main__' : i.intent;
    return {
      intent: i.intent,
      raw_inputs: this.parseArray(i.raw_inputs).map(ri => this.parseObject(ri)),
      arguments: args ?
        this.parseCLIArguments(args) :
        this.parseAssistantArguments(this.parseArray(i.arguments).map(arg => this.parseObject(arg)))
    };
  }

  parseInputs(inputs) {
    return this.parseArray(inputs).map(input => this.parseInput(input));
  }

  formatResponse(err, message) {

    return {
      expect_user_response: false,
      final_response: {
        speech_response: {
          text_to_speech: this.formatMessage(err, message)
        }
      }
      /* error: this.formatError(err) */
    };

  }

  formatMessage(err, message) {
    return err ?
      `There was an error with your request, ${err.message}` :
      message;
  }

  formatError(err) {
    return err ?
      {message: err.message} :
      undefined;
  }

  find(intent, callback) {

    let action = this._actions[intent];

    if (!action) {

      let dirname = path.join(this.pathname, intent);
      let pathname = path.join(this.pathname, intent, 'index.js');

      action = {};

      if (!fs.existsSync(dirname)) {
        action.error = new Error(`Intent not found: ${intent}`);
      } else {
        try {
          action = require(pathname);
        } catch (e) {
          action.error = e;
          return callback(action.error);
        }
        action.action = action || undefined;
      }

      this._actions[intent] = action;

    }

    if (action.error) {
      return callback(action.error);
    } else {
      return callback(null, action.action);
    }

  }

  execute(params, callback) {

    let user = this.parseUser(params.kwargs.user);
    let conv = this.parseConversation(params.kwargs.conversation);
    let inputs = this.parseInputs(params.kwargs.inputs);
    let topInput = inputs[0] || this.parseInput(null, params.args[0], params.kwargs);
    let intent = topInput.intent;
    let cb = (err, message) => callback(null, this.formatResponse(err, message));

    this.find(intent, (err, action) => {

      if (err) {
        return cb(err);
      }

      action(user, conv, topInput.arguments, cb);

    });

  }

}

module.exports = Router;
