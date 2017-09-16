#!/usr/bin/env node
const fs = require('fs-extra');
const _ = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');
const Logger = require('./util/logger.js');

class CLI{
  constructor(){
    
    this.options = {
      project: 'Create a new project',
      page: 'Create a new page',
      module: 'Create a new module',
      push: 'Push a new stage',
      update: 'Update a current stage',
      help: 'Show help',
      exit: 'Exit'
    }

    // Builders
    this.builders = {};
    this.builderPostfix = '.builder';
    this.generateBuildersFromFolder('./builders/').then(()=>{
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

  menu(){
    inquirer.prompt({
      type: 'list',
      name: 'main',
      message: 'What would you like to do?',
      choices: [
        this.options.project,
        this.options.page,
        this.options.module,
        this.options.push,
        this.options.update,
        this.options.help,
        this.options.exit
      ]
    }).then((answer) => {
      switch (answer.main) {
        case this.options.project:
          this.project();
          break;
        case this.options.page:
          this.page();
          break;
        case this.options.module:
          this.module();
          break;
        default:
          break;
      }
    });
  }

  generateBuildersFromFolder(path){
    return new Promise(resolve => {
      // Get all the available framework builders stored in the `path` directory
      this.getAvailableFrameworks(path).then((frameworks) => {
        for(let i = 0; i < frameworks.length; i++){
          const path = frameworks[i].path;
          const name = frameworks[i].name;

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
    this.getFramework().then(which => {
      this.builders[which].project();
    });
  }

  page() {
    this.getFramework().then(which => {
      this.builders[which].page();
    })
  }
 
  module() {
    this.getFramework().then(which => {
      this.builders[which].module();
    })
  }  
}

const cli = new CLI();