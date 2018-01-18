// const fs = require('fs-extra');
// const chalk = require('chalk');
const inquirer = require('inquirer');
// const cmd = require('node-cmd');
// const exec = require('ssh-exec');
const Listr = require('listr');
// const { ProjectInfo } = require('../util');
const Command = require('./command');

class BuildModule extends Command {

  prompts = () => [{
    type: 'input',
    name: 'test',
    message: 'test',
  }]

  tasks = answers => [{
    title: 'Do Something',
    task: task => new Promise((resolve, reject) => { // eslint-disable-line
      // console.log(answers.test)
      resolve()
      // reject(new Error('something is broken'))
    })
  }]

  commandWillRun = () => new Promise(resolve => {
    console.log('command will run')
    resolve()
  })

  commandDidRun = () => new Promise(resolve => {
    console.log('command did run')
    resolve()
  })

}

module.exports = new BuildModule();
