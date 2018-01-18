const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const glob = require('glob');
// const cmd = require('node-cmd');
// const exec = require('ssh-exec');
const Listr = require('listr');
const { Naming, FileIO } = require('../util');
const Command = require('./command');

class BuildModule extends Command {

  constructor() {
    super();
    this.state = {
      templatePath: FileIO.getTemplatePath('new-project'),
      dirName: '',
      dirPath: ''
    }
  }

  prompts = () => [{
      type: 'input',
      name: 'name',
      message: 'Project name?',
      default: () => path.basename(path.resolve('./')),
    }, {
      type: 'input',
      name: 'description',
      message: 'Project description?',
      default: () => 'new project',
    }, {
      type: 'input',
      name: 'repo',
      message: 'Project repository url?',
      default: () => 'https://bitbucket.org/lofty/...',
    }, {
      type: 'input',
      name: 'port',
      message: 'Project port?',
      default: () => '3000',
    }, {
      type: 'confirm',
      name: 'npm',
      message: 'Run npm install?',
      default: true,
    }, {
      type: 'confirm',
      name: 'git',
      message: 'Make initial commit?',
      default: true,
  }]

  tasks = answers => [{
      title: `Create ${Naming.getDirName(answers.name)} directory`,
      task: (task) => new Promise((resolve, reject) => {
        // assign directory details in state
        this.state.dirName = Naming.getDirName(answers.name);
        this.state.dirPath = path.join('./', this.state.dirName);
        // create directory
        fs.mkdir(this.state.dirName, (err) => {
          err ? reject(new Error(err)) : resolve()
        })
      })
    }, {
      title: 'Copy template files',
      task: (task) => new Promise((resolve, reject) => {
        // get all files in the template path
        glob(path.join(this.state.templatePath, '**'), { nodir: true, dot: true }, (err, files) => {
          if (err) reject(new Error(err))
          // write each file to the directory path
          files.forEach((file) => {
            const templatePath = file;
            const writePath = file.replace(this.state.templatePath, this.state.dirPath);
            const templateData = answers;
            FileIO.writeTemplateFile(templatePath, writePath, templateData);
          })
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(new Error(error)))
      })
    }, {
      title: 'Run npm install',
      skip: () => !answers.npm,
      task: (task) => new Promise((resolve, reject) => {
        // console.log(answers.test)
        resolve()
        // reject(new Error('something is broken'))
      })
    }, {
      title: 'Make initial commit',
      skip: () => !answers.git,
      task: (task) => new Promise((resolve, reject) => {
        // console.log(answers.test)
        resolve()
        // reject(new Error('something is broken'))
      })
  }]

}

module.exports = new BuildModule();
