#!/usr/bin/env node
const fs = require('fs-extra');
const _ = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const cmd = require('node-cmd');
const Logger = require('./util/logger.js');

class CLI{
  constructor(){
    // Builders
    this.builders = {};
    this.builderPostfix = '.builder';
    const builderDirectory = path.join(__dirname, '/builders/');
    this.generateBuildersFromFolder(builderDirectory).then(()=>{
      // BEGIN
      this.greet();
    });
  }

  greet(){
    // Greeting
    let box = Logger.box({
      minWidth: 40, 
      minHeight: 0, 
      sidePadding: 2, 
      verticalPadding: 2, 
      linesOfText: [
        'Hello there!', 
        'Welcome to the Lofty CLI',
      ]
    });
    console.log(chalk.blue(box));
    this.menu();
  }

  menu(showAll = false){
    const options = {
      project: 'Create a new project',
      page: 'Create a new page',
      module: 'Create a new module',
      run: 'Run project in development mode',
      push: 'Push a new stage',
      update: 'Update a current stage',
      showAll: 'Show all options',
      help: 'Show help',
      exit: 'Exit'
    }

    this.getExistingProjectInfo().then((info) => {
      let choices = [];
      // There wasn't a package.json file, so give the option to make a project
      if(info == null || showAll){ choices.push(options.project); }
      // If there was a package.json file, we give more options because a project exists
      if(info != null || showAll){
        choices.push(options.page);
        choices.push(options.module);
        choices.push(options.run);
        choices.push(options.push);
        choices.push(options.update);
      }

      // Allow option to show all if we aren't showing everything
      if(!showAll){ choices.push(options.showAll); }

      // Always include help and exit
      choices.push(options.help);
      choices.push(options.exit);

      inquirer.prompt({
        type: 'list',
        name: 'main',
        message: 'What would you like to do?',
        choices: choices
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
          case options.run:
            this.runProjectInDevelopment();
            break;
          default:
            break;
        }
      });
    });
  }

  runProjectInDevelopment(){
    cmd.run('npm run dev');
  }

  generateBuildersFromFolder(path){
    return new Promise(resolve => {
      // Get all the available framework builders stored in the `path` directory
      this.getAvailableFrameworks(path).then((frameworks) => {
        for(let i = 0; i < frameworks.length; i++){
          const path = frameworks[i].path;
          const name = _.lowerCase(frameworks[i].name);

          // Check to see if there's an index.js file in our folder
          if (fs.existsSync(`${path}/index.js`)){
            // Load the framework builder
            const framework = require(path);
            
            // If we successfully imported a constructor function 
            //  from the builder directory
            if(typeof framework === 'function') {
              const builderObject = new framework();
              // Is the builder inheriting from the builder.js superclass?
              if(builderObject.isBuilder) {
                this.builders[name] = new framework();
              }else{
                Logger.logError(`It looks like the builder in ${path} is not a subclass of Builder in builder.js. You should probs fix that.`)
              }
            }
            // There was a problem with the builder class
            else{
              Logger.logError(`There was an issue with the builder in ${path}. This could be due to the class not being exported (module.exports = BuilderName).`);
            }
          }
          // There was a problem with the builder directory
          else{
            Logger.logError(`There was an issue with the builder in ${path}. This could be due to a missing index.js file.`);
          }
        }

        resolve();
      });
    });
  }

  getExistingProjectInfo(){
    return new Promise((resolve) => {
      this.getDirectories('./').then((directories) => {
        // If we've got a package.json file in 
        if(directories.indexOf('package.json') > -1){
          const json = fs.readFileSync('./package.json', 'utf8');
          const projectInfo = JSON.parse(json);
          resolve(projectInfo);
        }
        resolve(null);
      });
    });
  }

  writeToProjectInfo(key, value){
    return new Promise((resolve, reject) => {
      this.getExistingProjectInfo().then((projectInfo) => {
        if(projectInfo){
          projectInfo[key] = value;
          const newProjectInfo = JSON.stringify(projectInfo, null, 2);
          fs.writeFile('./package.json', newProjectInfo, (error) => {
            if(error){
              reject(error)
            }else{
              resolve('success')
            }
          });
        }else{
          reject('package.json file does not exist in this directory');
        }
      });
    })
  }

  getFrameworkForExistingProject(){
    return new Promise((resolve, error) => {
      // Is there a project already in the current directory?
      this.getExistingProjectInfo().then((info) => {
        // If there is a project and the project's `package.json` file has the `framework` attribute
        if(info != null && typeof info.framework === 'string'){
          // Check to see if there's actually a builder that matches the project's framework
          const builder = this.builders[_.lowerCase(info.framework)];
          if(builder != null && builder.isBuilder){
            // If there is, we're good to go
            resolve(builder);
          }else{
            // If there isn't, we can't do anything
            error(`No builder matches '${info.framework}'`);
          }
        }
        // Otherwise there's no framework attribute, so we need to ask the user which framework
        //  to use out of the available builders
        else{
          Logger.logError('`framework` is missing from the package.json');
          this.getFramework().then(which => {
            // We need to make sure this builder is valid
            const builder = this.builders[which];
            if(builder != null && builder.isBuilder){
              resolve(builder);
              this.writeToProjectInfo('framework', which);
            }
            // We don't have a valid builder
            else{
              error('Invalid builder');
            }
          });
        }
      });
    });
  }

  getAvailableFrameworks(path){
    return new Promise(resolve => {
      let frameworks = [];
      this.getDirectories(path).then((files) => {
        for(let i = 0; i < files.length; i++){
          const file = files[i];
          // Check to see if there's a directory for the framework we want
          if(file.includes(this.builderPostfix)){
            let frameworkName = file.replace(this.builderPostfix, '');
            frameworkName = _.capitalize(frameworkName);
            frameworks.push({name: frameworkName, path: `${path}${file}`});
          }
          resolve(frameworks);
        }
      })
    });
  }

  getDirectories(source) {
    return new Promise(resolve => {
      resolve(fs.readdirSync(source));
    });
  }

  // Function to prompt user for framework
  getFramework() {
    return new Promise((resolve) => {
      inquirer.prompt({
        type: 'list',
        name: 'which',
        message: 'With which framework?',
        choices: Object.keys(this.builders),
      }).then((ans) => resolve(ans.which));
    });
  }

  project() {
    // Check to see if there's a project already in the current directory.
    //  Even though we're gonna create a sub folder for the project,
    //  it's still weird to create a project inside of a project...
    this.getExistingProjectInfo().then((info) => {
      // If there's already a project in the current directory,
      //  we don't want to create another project
      if(info != null){
        Logger.logError('A project already exists in the current directory...');
        // Give the option to create a project anyway
        //  just in case they really know what they're doing
        inquirer.prompt({
          type: 'confirm',
          name: 'proceed',
          message: 'Proceed anyway?',
          default: false
        }).then((ans) => {
          if(ans.proceed){
            this.getFramework().then(which => {
              this.builders[which].project().then(()=>{
                this.menu();
              });
            });
          }
        });
      }
      // There isn't a project in the current directory
      //  (or at least there isn't a package.json file...)
      //  so we can create a new project
      else{
        this.getFramework().then(which => {
          this.builders[which].project().then(() => {
            this.menu();
          });
        });
      }
    });
  }

  page() {
    this.getFrameworkForExistingProject().then((builder) => {
      builder.page().then(() => {
        this.menu();
      });
    }).catch((error) => {
      Logger.logError(error);
    });
  }
 
  module() {
    this.getFrameworkForExistingProject().then((builder) => {
      builder.module().then(() => {
        this.menu();
      });
    }).catch((error) => {
      Logger.logError(error);
    });
  }  
}

const cli = new CLI();