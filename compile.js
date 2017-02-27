const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const tar = require('tar-stream');
const async = require('async');

function readFiles(base, properties, dir, data) {

  dir = dir || '/';
  data = data || [];
  properties = properties || {};

  let ignore = properties.ignore || {};

  return fs.readdirSync(path.join(base, dir)).reduce((data, f) => {

    let pathname = path.join(dir, f);
    let fullpath = path.join(base, pathname);

    for (let i = 0; i < ignore.length; i++) {
      if (ignore[i][0] === '/') {
        if (pathname.split(path.sep).join('/') === ignore[i]) {
          return data;
        }
      } else {
        if (f === ignore[i]) {
          return data;
        }
      }
    }

    if (fs.statSync(fullpath).isDirectory()) {
      return readFiles(base, properties, pathname, data);
    } else {
      let filename = pathname[0] === path.sep ? pathname.substr(1) : pathname;
      let buffer = fs.readFileSync(fullpath);
      filename = filename.split(path.sep).join('/'); // Windows
      data.push({filename: filename, buffer: buffer});
      return data;
    }

  }, data);

};

function compile(dir, callback) {

  let srcname = `_files`;
  let tmpname = `files.tar`;
  let filename = `files.tgz`;

  console.log(`Compressing "${path.join(dir, srcname)}"...`);

  let dirname = path.join(dir, srcname);
  let pathname = path.join(dir, tmpname);
  let finalpath = path.join(dir, filename);

  fs.existsSync(pathname) && fs.unlinkSync(pathname);

  let tarball = fs.createWriteStream(pathname);
  let pack = tar.pack();
  pack.pipe(tarball);

  let data = readFiles(
    dirname,
    {
      ignore: [
        '/node_modules',
        '/.stdlib',
        '/.git',
        '.DS_Store',
      ]
    }
  );

  async.parallel(data.map((file) => {
    return (callback) => {
      pack.entry({name: file.filename, mode: 0o777}, file.buffer, callback);
    };
  }), (err) => {

    if (err) {
      return callback(err);
    }

    pack.finalize();

  });

  tarball.on('close', () => {

    let buffer = fs.readFileSync(pathname);
    fs.unlinkSync(pathname);

    zlib.gzip(buffer, (err, result) => {

      if (err) {
        return callback(err);
      }

      fs.writeFileSync(finalpath, result);
      callback();

    });

  });

};

console.log(`Compressing templates...`);

let root = './templates';
async.series(
  fs.readdirSync(root).map(dir => {
    return cb => compile(path.join(root, dir), cb);
  }),
  (err) => {
    if (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    } else {
      console.log(`Success! Templates compressed successfully.`);
      process.exit(0);
    }
  }
);
