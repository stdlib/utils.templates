const fs = require('fs');
const path = require('path');
const root = './templates';
const filename = 'files.tgz';

const files = fs.readdirSync(root).reduce((files, dir) => {
  let pathname = path.join(root, dir, filename);
  files[dir] = fs.existsSync(pathname) ?
    fs.readFileSync(pathname) : new Buffer(0);
  return files;
}, {});

module.exports = (params, callback) => {

  let name = params.kwargs.name;

  if (!files.hasOwnProperty(name)) {
    return callback(new Error(`No such template: ${name}`));
  } else {
    callback(null, files[name]);
  }

};
