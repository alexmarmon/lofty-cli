#!/usr/bin/env node
const fs = require('fs-extra');
const _ = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');
const VueBuilder = require('./builders/vue.builder.js');
const ReactBuilder = require('./builders/react.builder.js');

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
    this.builderPostfix = '.builder.js';    
    this.generateBuildersFromFolder('./builders/');
    
    //
    // BEGIN
    //
    this.greet();
  }

  greet(){
    // Greeting
    console.log(`\n\n${chalk.bold(chalk.blue('═════════════════════════'))}`)
    console.log(`${chalk.bold(chalk.blue('Welcome to the Lofty CLI!'))}`)
    console.log(`${chalk.bold(chalk.blue('═════════════════════════'))}\n\n`)
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
    this.getAvailableFrameworks(path).then((frameworks) => {
      for(let i = 0; i < frameworks.length; i++){
        const path = frameworks[i].path;
        const name = frameworks[i].name;
        const framework = require(path);
        this.builders[name] = new framework();
      }
    });
  }

  getAvailableFrameworks(path){
    return new Promise(resolve => {
      let frameworks = [];
      this.getDirectories(path).then((files) => {
        for(let i = 0; i < files.length; i++){
          const file = files[i];
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

  // function to prompt user for framework
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