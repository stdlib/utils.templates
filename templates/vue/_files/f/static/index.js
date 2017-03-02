const fs = require('fs');
const mime = require('mime');
const helper = require('../../lib/helper.js');

let filepath = './static';
let staticFiles = helper.readFiles(filepath);

module.exports = (params, callback) => {

  if (params.env === 'dev') {
    staticFiles = helper.readFiles(filepath);
  }

  let path = params.kwargs.path;
  let contentType = 'text/plain';
  let buffer;
  let headers = {};
  headers['Cache-Control'] = 'max-age=31536000';

  if (!staticFiles[path]) {
    headers['Content-Type'] = 'text/plain';
    buffer = new Buffer('404 - Not Found');
  } else {
    headers['Content-Type'] = mime.lookup(path);
    buffer = staticFiles[path];
  }

  return callback(null, buffer, headers);

};
