const path = require('path');
const fs = require('fs');

/**
* Read files in a directory, for mapping /static files to the static
*   function
*/
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

  }
};
