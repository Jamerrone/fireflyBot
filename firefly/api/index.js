// Source: https://github.com/mdn/browser-compat-data/blob/master/index.js

const fs = require('fs');
const path = require('path');
const extend = require('extend');

const load = args => {
  let dir;
  let result = {};

  const processFilename = fn => {
    const fp = path.join(dir, fn);
    let extra;

    if (fs.statSync(fp).isDirectory()) {
      extra = load(fp);
    } else if (path.extname(fp) === '.json') {
      try {
        extra = require(fp);
      } catch (e) {}
    }

    result = extend(true, result, extra);
  };

  for (dir of args) {
    dir = path.resolve(__dirname, dir);
    fs.readdirSync(dir).forEach(processFilename);
  }

  return result;
};

module.exports = load(['properties']);
