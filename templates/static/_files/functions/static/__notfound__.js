const fs = require('fs');
const mime = require('mime');
const fileio = require('../../helpers/fileio.js');
const path = require('path');

let filepath = './static';
let staticFiles = fileio.readFiles(filepath);

/**
 * This endpoint handles all routes to `/static` over HTTP, and maps them to the
 *  `./static` service folder
 * @returns {Buffer}
 */
module.exports = (context, callback) => {

  // Hot reload for local development
  if (context.service && context.service.environment === 'local') {
    staticFiles = fileio.readFiles(filepath);
  }

  let staticFilepath = path.join(...context.path.slice(1));
  let buffer;
  let headers = {};

  headers['Cache-Control'] = context.service.environment === 'release' ?
    'max-age=31536000' :
    'max-age=0';

  if (!staticFiles[staticFilepath]) {
    headers['Content-Type'] = 'text/plain';
    buffer = new Buffer('404 - Not Found');
  } else {
    headers['Content-Type'] = mime.lookup(staticFilepath);
    buffer = staticFiles[staticFilepath];
  }

  return callback(null, buffer, headers);

};
