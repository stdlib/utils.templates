const respond = require('../../alexa/respond.js');
const router = require('../../alexa/router.js');

module.exports = (params, callback) => {

  router(params, (err, result) => {

    err ?
      respond.error(err, callback) :
      respond.say(result, callback);

  });

};
