const fs = require('fs-extra');
const _ = require('lodash');

class Naming {
  getDirName = str => _.kebabCase(str)
}

module.exports = new Naming();
