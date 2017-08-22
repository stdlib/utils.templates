const fs = require('fs');
const path = require('path');

const filepath = path.join('static', 'index.html');
let index = fs.existsSync(filepath) ?
  fs.readFileSync(filepath) :
  new Buffer('No index.html specified');

/**
 * Serves index.html for dashboard.
 * @returns {Buffer}
 */
module.exports = (context, callback) => {

  if (context.service && context.service.environment === 'local') {

    index = fs.existsSync(filepath) ?
      fs.readFileSync(filepath) :
      new Buffer('No index.html specified');

  }

  return callback(null, index, {'Content-Type': 'text/html; charset=utf-8'});

};
