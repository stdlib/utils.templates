const fs = require('fs');
const mime = require('mime');
const helper = require('../../lib/helper.js');
const path = require('path');

let filepath = './static';
let staticFiles = helper.readFiles(filepath);

/**
 * Endpoint that serves static files.
 * @returns {Buffer}
 */
module.exports = (context, callback) => {

  if (context.service && context.service.environment === 'local') {
    staticFiles = helper.readFiles(filepath);
  }

  if (context.params.env) {
    return callback(null, new Buffer(`var env = ${JSON.stringify(process.env)};`), {'Content-Type': 'application/javascript'});
  }

  let staticFilepath = path.join(...context.path.slice(1));
  let contentType = 'text/plain';
  let buffer;
  let headers = {};
  headers['Cache-Control'] = 'max-age=31536000';

  if (!staticFiles[staticFilepath]) {
    headers['Content-Type'] = 'text/plain';
    buffer = new Buffer('404 - Not Found');
  } else {
    headers['Content-Type'] = mime.lookup(staticFilepath);
    buffer = staticFiles[staticFilepath];
  }

  return callback(null, buffer, headers);

};
