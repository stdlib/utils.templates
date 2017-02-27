const path = require('path');
const fs = require('fs');

function writeDirs(base, pathname, cache) {

  let isFile = true;

  if (!pathname) {
    pathname = base;
    base = '';
    isFile = false
  } else {
    pathname = pathname.split('/').join(path.sep);
  }

  let dirs = pathname.split(path.sep);
  let newdirs = [];

  while (dirs.length > (isFile ? 1 : 0)) {
    newdirs = newdirs.concat(dirs.shift());
    let dir = path.join.apply(path, newdirs);
    let cd = path.join(base, dir);
    if (!cache || !cache[cd]) {
      !fs.existsSync(cd) && fs.mkdirSync(cd);
      cache && (cache[cd] = true);
    }
  }

};

module.exports = {
  readFiles: function (base, dir, files) {

    dir = dir || '';
    files = files || {};
    let pathname = path.join(base, dir);

    let dirList = fs.readdirSync(pathname);

    for (let i = 0; i < dirList.length; i++) {
      let dirpath = path.join(dir, dirList[i]);
      let dirname = dirpath.split(path.sep).join('/');
      let fullpath = path.join(pathname, dirList[i]);
      if (fs.lstatSync(fullpath).isDirectory()) {
        this.readFiles(base, dirpath, files);
      } else {
        files[dirname] = fs.readFileSync(fullpath);
      }
    }

    return files;

  },
  writeFiles: function (base, files) {
    writeDirs(base);
    let cache = {};
    Object.keys(files).forEach(f => {
      writeDirs(base, f, cache);
      fs.writeFileSync(path.join(base, f), files[f]);
    });
  }
};
