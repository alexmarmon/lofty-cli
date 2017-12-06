const fs = require('fs-extra');

class Common {
  getDirectories = source => new Promise((resolve) => {
    resolve(fs.readdirSync(source));
  })
}

module.exports = new Common();
