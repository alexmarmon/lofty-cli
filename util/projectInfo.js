const fs = require('fs-extra');
const _ = require('lodash');
const inquirer = require('inquirer');
const FileIO = require('./fileIO');
const BuilderInfo = require('./builderInfo');
const Logger = require('./logger');

class ProjectInfo {
  get = () => new Promise((resolve) => {
    FileIO.getDirectories('./').then((directories) => {
      // If we've got a package.json file in
      if (directories.indexOf('package.json') > -1) {
        const json = fs.readFileSync('./package.json', 'utf8');
        const projectInfo = JSON.parse(json);
        resolve(projectInfo);
      }
      resolve(null);
    });
  })

  getFramework = () => new Promise((resolve, error) => {
    // Is there a project already in the current directory?
    this.get().then((info) => {
      // If there is a project and the project's `package.json` file has the `framework` attribute
      if (info != null && typeof info.framework === 'string') {
        // Check to see if there's actually a builder that matches the project's framework
        const builder = BuilderInfo.builders[_.lowerCase(info.framework)];
        if (builder != null && builder.isBuilder) {
          // If there is, we're good to go
          resolve(builder);
        } else {
          // If there isn't, we can't do anything
          error(`No builder matches '${info.framework}'`);
        }
      }
      // Otherwise there's no framework attribute, so we need to ask the user which framework
      //  to use out of the available builders
      else {
        // Logger.logError('`framework` is missing from the package.json');
        this.getFrameworkFromUser().then((which) => {
          // We need to make sure this builder is valid
          const builder = BuilderInfo.builders[which];
          if (builder != null && builder.isBuilder) {
            // If we have a package.json file we want to write the framework type to that file
            // but regardless, we want to return the builder
            this.writeToProjectInfo('framework', which).then(() => {
              resolve(builder);
            }).catch((errorMsg) => {
              resolve(builder);
            });
          }
          // We don't have a valid builder
          else {
            error('Invalid builder');
          }
        });
      }
    });
  })

  getFrameworkFromUser = () => new Promise((resolve) => {
    inquirer.prompt({
      type: 'list',
      name: 'which',
      message: 'With which framework?',
      choices: Object.keys(BuilderInfo.builders),
    }).then(ans => resolve(ans.which));
  })

  writeToProjectInfo = (key, value) => new Promise((resolve, reject) => {
    this.get().then((projectInfo) => {
      if (projectInfo) {
        projectInfo[key] = value;
        const newProjectInfo = JSON.stringify(projectInfo, null, 2);
        fs.writeFile('./package.json', newProjectInfo, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve('success');
          }
        });
      } else {
        reject('package.json file does not exist in this directory');
      }
    });
  })
}

module.exports = new ProjectInfo();
