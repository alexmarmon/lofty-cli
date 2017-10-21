const fs = require('fs-extra');
const _ = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const cmd = require('node-cmd');
const Logger = require('../util/logger.js');
const projectInfo = require('./projectInfo.js');
const updateStage = require('./updateStage.js');

class CLI {
  constructor() {
    // Builders
    this.builders = {};
    this.builderPostfix = '.builder';
    const builderDirectory = path.join(__dirname, '../builders/');
    this.generateBuildersFromFolder(builderDirectory).then(() => {
      // BEGIN
      this.greet();
    });
  }

  greet = () => {
    // Greeting
    const box = Logger.box({
      minWidth: 40,
      minHeight: 0,
      sidePadding: 2,
      verticalPadding: 2,
      linesOfText: [
        'Hello there!',
        'Welcome to the Lofty CLI',
      ],
    });
    console.log(chalk.blue(box));
    this.menu();
  }

  menu = (showAll = false) => {
    const options = {
      project: 'Create a new project',
      page: 'Create a new page',
      module: 'Create a new module',
      push: 'Push a new stage',
      update: 'Update a current stage',
      showAll: 'Show all options',
      help: 'Show help',
      exit: 'Exit',
    };

    projectInfo.get().then((info) => {
      const choices = [];
      // There wasn't a package.json file, so give the option to make a project
      if (info == null || showAll) { choices.push(options.project); }
      // If there was a package.json file, we give more options because a project exists
      if (info != null || showAll) {
        choices.push(options.page);
        choices.push(options.module);
        choices.push(options.push);
        choices.push(options.update);
      }

      // Allow option to show all if we aren't showing everything
      if (!showAll) { choices.push(options.showAll); }

      // Always include help and exit
      choices.push(options.help);
      choices.push(options.exit);

      inquirer.prompt({
        type: 'list',
        name: 'main',
        message: 'What would you like to do?',
        choices,
      }).then((answer) => {
        switch (answer.main) {
          case options.project:
            this.project();
            break;
          case options.page:
            this.page();
            break;
          case options.module:
            this.module();
            break;
          case options.showAll:
            this.menu(true);
            break;
          case options.update:
            // this.updateProjectStage();
            updateStage.run().then(() => console.log('ha'));
            break;
          default:
            break;
        }
      });
    });
  }

  runProjectInDevelopment = () => {
    cmd.run('npm run dev');
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
    projectInfo.getDirectories(buildersPath).then((files) => {
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

  project = () => {
    // Check to see if there's a project already in the current directory.
    //  Even though we're gonna create a sub folder for the project,
    //  it's still weird to create a project inside of a project...
    projectInfo.get().then((info) => {
      // If there's already a project in the current directory,
      //  we don't want to create another project
      if (info != null) {
        Logger.logError('A project already exists in the current directory...');
        // Give the option to create a project anyway
        //  just in case they really know what they're doing
        inquirer.prompt({
          type: 'confirm',
          name: 'proceed',
          message: 'Proceed anyway?',
          default: false,
        }).then((ans) => {
          if (ans.proceed) {
            this.getFramework().then((which) => {
              this.builders[which].project().then(() => {
                this.menu();
              });
            });
          }
        });
      }
      // There isn't a project in the current directory
      //  (or at least there isn't a package.json file...)
      //  so we can create a new project
      else {
        this.getFramework().then((which) => {
          this.builders[which].project().then(() => {
            this.menu();
          });
        });
      }
    });
  }

  page = () => {
    projectInfo.getFramework().then((builder) => {
      builder.page().then(() => {
        this.menu();
      });
    }).catch((error) => {
      Logger.logError(error);
    });
  }

  module = () => {
    projectInfo.getFramework().then((builder) => {
      builder.module().then(() => {
        this.menu();
      });
    }).catch((error) => {
      Logger.logError(error);
    });
  }
}

const cli = new CLI(); // eslint-disable-line
