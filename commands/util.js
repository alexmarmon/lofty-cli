const fs = require('fs-extra');

class Util {
  getDirectories = source => new Promise((resolve) => {
    resolve(fs.readdirSync(source));
  })
}

module.exports = new Util();