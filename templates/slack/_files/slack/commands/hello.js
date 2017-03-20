/**
  This is a "hello" command, responding to "/hello" based on the filename.
  To test, make sure you add it to the Slash Commands for your bot with "/hello"
*/

function HelloCommandHandler(token, command, text, reply, callback) {

  reply(`Hello, <@${command.user}>...`, (err, result) => {

    return callback(null, `You said: ${text}`);

  });

};

module.exports = HelloCommandHandler;
