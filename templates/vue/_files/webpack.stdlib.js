const helper = require('./lib/helper.js');
const crypto = require('crypto');
const path = require('path');

const fs = require('fs-extra');

function md5(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex').substr(0, 8);
}

class stdlibPlugin {

  constructor(opts) {
    opts = opts || {};
    this.src = opts.src || './app/static';
    this.dest = opts.dest || './static/';
    this.ignore = opts.ignore || ['index.html'];
  }

  apply(compiler) {

    compiler.plugin('after-emit', (compilation, callback) => {

      let srcfiles = helper.readFiles(this.src);
      let destfiles = {};
      let filemap = {};

      Object.keys(srcfiles).forEach(f => {

        if (this.ignore.indexOf(f) > -1) {
          destfiles[f] = srcfiles[f];
          filemap[f] = f;
          return;
        }

        let hash = md5(srcfiles[f]);
        let filepath = f.split('/');
        let filename = filepath.pop().split('.');
        let ext = filename.pop();
        filename = filename.concat(hash, ext).join('.');
        filepath.push(filename);
        destfiles[filepath.join('/')] = srcfiles[f];
        filemap[f] = filepath.join('/');

      });

      Object.keys(destfiles).forEach(f => {

        if (f.match(/\.(html?|js)$/)) {
          destfiles[f] = new Buffer(
            destfiles[f]
              .toString()
              .replace(/"static\/\?path=(.*?)"/g, (all, g) => filemap[g] ? `"static/?path=${filemap[g]}"` : all)
          );
        }

      });

      fs.removeSync(this.dest);
      helper.writeFiles(this.dest, destfiles);
      callback();

    });

  }
}

module.exports = stdlibPlugin;
