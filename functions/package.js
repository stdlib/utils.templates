const fs = require('fs');
const path = require('path');
const root = './templates';
const filename = 'package.json';

const pkgs = fs.readdirSync(root).reduce((pkgs, dir) => {
  let pathname = path.join(root, dir, filename);
  let pkg = fs.existsSync(pathname) ?
    fs.readFileSync(pathname) : new Buffer(0);
  try {
    pkg = JSON.parse(pkg.toString());
  } catch (e) {
    pkg = {};
  }
  pkgs[dir] = pkg;
  return pkgs;
}, {});

/**
* Returns package.json values for this StdLib template
* @param {string} name The name of the StdLib template
* @returns {object}
*/
module.exports = (name, callback) => {

  if (!pkgs.hasOwnProperty(name)) {
    return callback(new Error(`No such template: ${name}`));
  } else {
    callback(null, pkgs[name]);
  }

};
