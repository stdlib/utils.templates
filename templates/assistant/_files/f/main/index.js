const Action = require('gactions').Action;
const myAction = new Action().loadIntents('./action/intents');

module.exports = (params, callback) => {

  if (!params.kwargs.conversation || !params.kwargs.conversation.conversation_id) {
    return myAction.testIntent(params.args[0], params.kwargs, callback);
  }

  myAction.runIntent(params.kwargs, callback);

};
