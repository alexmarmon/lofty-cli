const fs = require('fs-extra');
const _ = require('lodash');
const projectInfo = require('./projectInfo.js');
const util = require('./util.js');

class BuildInfo {
  constructor () {
    this.builders = {};
    this.builderPostfix = '.builder';
  }

  generateBuildersFromFolder = buildersPath => new Promise((resolve) => {
    // Get all the available framework builders stored in the `buildersPath` directory
    this.getAvailableFrameworks(buildersPath).then((frameworks) => {
      for (let i = 0; i < frameworks.length; i += 1) {
        const frameworkPath = frameworks[i].buildersPath;
        const name = _.lowerCase(frameworks[i].name);

        // Check to see if there's an index.js file in our folder
        if (fs.existsSync(`${frameworkPath}/index.js`)) {
          // Load the framework builder
          const framework = require(frameworkPath); // eslint-disable-line

          // If we successfully imported a constructor function
          //  from the builder directory
          if (typeof framework === 'function') {
            const builderObject = new framework(); // eslint-disable-line
            // Is the builder inheriting from the builder.js superclass?
            if (builderObject.isBuilder) {
              this.builders[name] = new framework(); // eslint-disable-line
            } else {
              Logger.logError(`It looks like the builder in ${frameworkPath} is not a subclass of Builder in builder.js. You should probs fix that.`);
            }
          }
          // There was a problem with the builder class
          else {
            Logger.logError(`There was an issue with the builder in ${frameworkPath}. This could be due to the class not being exported (module.exports = BuilderName).`);
          }
        }
        // There was a problem with the builder directory
        else {
          Logger.logError(`There was an issue with the builder in ${frameworkPath}. This could be due to a missing index.js file.`);
        }
      }

      resolve();
    });
  })

  getAvailableFrameworks = buildersPath => new Promise((resolve) => {
    const frameworks = [];
    util.getDirectories(buildersPath).then((files) => {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        // Check to see if there's a directory for the framework we want
        if (file.includes(this.builderPostfix)) {
          let frameworkName = file.replace(this.builderPostfix, '');
          frameworkName = _.capitalize(frameworkName);
          frameworks.push({ name: frameworkName, buildersPath: `${buildersPath}${file}` });
        }
        resolve(frameworks);
      }
    });
  })
}

module.exports = new BuildInfo();