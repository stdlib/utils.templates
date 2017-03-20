const fs = require('fs');
const path = require('path');

const filepath = path.join('static', 'index.html');
let index = fs.existsSync(filepath) ?
  fs.readFileSync(filepath) :
  new Buffer('No index.html specified');

module.exports = (params, callback) => {

  if (params.env === 'dev') {

    index = fs.existsSync(filepath) ?
      fs.readFileSync(filepath) :
      new Buffer('No index.html specified');

  }

  if (params.kwargs.hasOwnProperty('env')) {
    return callback(null, new Buffer(`var env = ${JSON.stringify(process.env)};`), {'Content-Type': 'application/javascript'});
  } else {
    return callback(null, index, {'Content-Type': 'text/html; charset=utf-8'});
  }

};
