/**
*  Please see:
*  https://developers.google.com/actions/reference/conversation#http-response
*
*  This function automatically generates an HTTP response via the callback.
*  Visit https://github.com/stdlib/gactions for more information
*/


module.exports = (user, device, conversation, query, callback) => {

  callback(
    null,
    `Hey there! What's up?`,
    [
      'Are you still there?',
      'Hello?',
      'Can you hear me?'
    ],
    [
      'text'
    ]
  );

};
