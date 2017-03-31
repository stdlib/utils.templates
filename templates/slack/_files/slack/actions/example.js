/**
  This is a handler for an action named "example". Parse actions based on the
  input action, then return a message as the second argument to {callback}
  either as a string or an object as specified here:
    https://api.slack.com/methods/chat.update
*/

function ExampleActionHandler(token, action, callback) {

  callback(null, 'You responded to the example action');

};

module.exports = ExampleActionHandler;
