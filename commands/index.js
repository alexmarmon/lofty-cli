const fs = require('fs-extra');
const _ = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const cmd = require('node-cmd');
const updateStage = require('./updateStage.js');
const buildProject = require('./buildProject.js');
const buildModule = require('./buildModule.js');
const { BuilderInfo, ProjectInfo, Logger } = require('../util')

class CLI {
  constructor() {
    const builderDirectory = path.join(__dirname, '../builders/');
    BuilderInfo.generateBuildersFromFolder(builderDirectory).then(() => {
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
        'Welcome to the 14Four CLI',
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

    ProjectInfo.get().then((info) => {
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
            // this.project();
            buildProject.run()
            // buildModule.run()
            break;
          case options.page:
            this.page();
            break;
          case options.module:
            buildModule.run()
            break;
          case options.showAll:
            this.menu(true);
            break;
          case options.update:
            updateStage.run().then(() => console.log('ha'));
            break;
          case options.help:
            this.help();
          default:
            break;
        }
      });
    });
  }

  project = () => {
    // Check to see if there's a project already in the current directory.
    //  Even though we're gonna create a sub folder for the project,
    //  it's still weird to create a project inside of a project...
    ProjectInfo.get().then((info) => {
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
            ProjectInfo.getFramework().then((builder) => {
              builder.project().then(() => {
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
        ProjectInfo.getFramework().then((builder) => {
          builder.project().then(() => {
            this.menu();
          });
        });
      }
    });
  }

  page = () => {
    ProjectInfo.getFramework().then((builder) => {
      builder.page().then(() => {
        this.menu();
      });
    }).catch((error) => {
      Logger.logError(error);
    });
  }

  module = () => {
    ProjectInfo.getFramework().then((builder) => {
      builder.module().then(() => {
        this.menu();
      });
    }).catch((error) => {
      Logger.logError(error);
    });
  }

  help = () => {
    Logger.log('Sending you to the wiki...');
    cmd.run('open -a "Google Chrome" https://bitbucket.org/14fourdev/14four-cli/wiki/Home');
  }
}

const cli = new CLI(); // eslint-disable-line
