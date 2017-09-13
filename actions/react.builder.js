const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const _ = require('lodash');
const Listr = require('listr');
const execa = require('execa');
const Builder = require('./builder');

class ReactBuilder extends Builder{
  
  constructor(){
    super();
  }

  //
  // ────────────────────────────────────────────────────── I ──────────
  //   :::::: P R O J E C T : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────
  //
  // Generates a new React project.
  project(){
    // Get our shared prompts from the superclass
    const prompts = this.prompts.project;
    inquirer.prompt(prompts).then((answers) => {
      // Create current working directory const
      const cwd = path.join('./' + _.kebabCase(answers.project));
      // Create tasks array
      const tasks = new Listr([
        {
          // create new directory
          title: 'Create dir',
          task: () => fs.ensureDir(cwd)
        },
        {
          // clone vue template into new directory
          // pass cwd option to specify where execa should execute
          title: 'Git clone',
          task: () => execa('git', ['clone', 'https://github.com/alexmarmon/vue-vuex-template', cwd])
        },
        {
          // add responses to package.json
          title: 'Inject package.json',
          task: () => this.buildFromTemplate(cwd, '/templates/vue/package.json', 'package.json', answers)
        },
        {
          // add responses to readme
          title: 'Inject readme',
          task: () => this.buildFromTemplate(cwd, '/templates/vue/README.md', 'README.md', answers)
        }
      ]);
    })
    .catch(err => console.log(err))

    // Run npm install if selection chosen
    if (answers.npm) {
      tasks.add({
        title: 'Npm install',
        task: () => execa('npm', ['install'], {cwd: path.resolve('./' + _.kebabCase(answers.name))})
      });
    }

    // Run the tasks
    tasks.run().then(() => {
      // Run page creation if selection chosen
      if (answers.pages) {
        console.log('\n\nPage Creation\n');
        const vue = new newPageVue();
        vue.prompt(cwd);
      }
    }).catch(err => console.log(err));
  }

  //
  // ──────────────────────────────────────────────────── I ──────────
  //   :::::: M O D U L E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────
  //
  // Generates a new React module.
  module(){
    const prompt = this.prompts.module;
  }

  //
  // ──────────────────────────────────────────────── I ──────────
  //   :::::: P A G E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────
  //
  // Generates a new React page.
  page(){
    const prompts = this.prompts.page;
    inquirer.prompt(prompts).then(answers => console.log(answers))
    .catch(err => console.log(err))
  }
}

module.exports = ReactBuilder;