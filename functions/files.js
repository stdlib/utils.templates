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

/**
* Returns tarball of files for StdLib template
* @param {string} name The name of the StdLib template
* @returns {buffer}
*/
module.exports = (name, callback) => {

  if (!files.hasOwnProperty(name)) {
    return callback(new Error(`No such template: ${name}`));
  } else {
    callback(null, files[name]);
  }

};
