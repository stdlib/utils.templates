const Router = require('../../assistant/router.js');
const router = new Router('./assistant/actions');

module.exports = (params, callback) => {

  router.execute(params, callback);

};
