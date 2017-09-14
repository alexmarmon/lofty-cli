const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const _ = require('lodash');
const Listr = require('listr');
const execa = require('execa');
const Builder = require('./builder');

class VueBuilder extends Builder{
  
  constructor(){
    super();
    this.templateGitRepo = 'https://github.com/alexmarmon/14four-vue.git';
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
      const cwd = path.join('./' + _.kebabCase(answers.name));

      //
      // TASKS
      //

      // Create tasks array
      const tasks = new Listr([
        {
          // Create new directory
          title: 'Create dir',
          task: () => fs.ensureDir(cwd)
        },
        {
          // Clone vue template into new directory
          // Pass cwd option to specify where execa should execute
          title: 'Git clone',
          task: () => execa('git', ['clone', this.templateGitRepo, cwd])
        },
        {
          // Add responses to package.json
          title: 'Inject package.json',
          task: () => this.buildFromTemplate(cwd, '/templates/vue/package.json', 'package.json', answers)
        },
        {
          // Add responses to readme
          title: 'Inject readme',
          task: () => this.buildFromTemplate(cwd, '/templates/vue/README.md', 'README.md', answers)
        }
      ]);

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
          this.page();
        }
      }).catch(err => console.log(err));
    })
    .catch(err => console.log(err))
  }

  //
  // ──────────────────────────────────────────────────── I ──────────
  //   :::::: M O D U L E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────
  //
  // Generates a new React module.
  module(){
    const prompts = this.prompts.module;
    inquirer.prompt(prompts).then((answers) => {

    })
    .catch(err => console.log(err))
  }

  //
  // ──────────────────────────────────────────────── I ──────────
  //   :::::: P A G E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────
  //
  // Generates a new React page.
  page(){
    const prompts = this.prompts.page;
    inquirer.prompt(prompts).then((answers) => {
       // create current working directory const
      let cwd;
      // if started from project creation
      if (dir) {
        cwd = path.join('./', dir);
      // if started from within project
      } else {
        cwd = path.resolve('./');
      }

      // create tasks array
      const tasks = new Listr([
        {
          // create new directory
          title: 'Create dir',
          task: () => fs.ensureDir(path.join(cwd, '/src/pages/', _.kebabCase(answers.name)))
        },
        {
          // create page .vue file
          title: 'Create vue file',
          task: () => this.buildFromTemplate(path.join(cwd, '/src/pages/', _.kebabCase(answers.name)), './templates/vue/new-page/new-page.vue', _.kebabCase(answers.name) + '.vue', answers)
        },
        {
          // create modules folder
          title: 'Create modules folder',
          task: () => fs.ensureDir(path.join(cwd, '/src/pages/', _.kebabCase(answers.name), '/modules'))
        },
        {
          // add page to router
          title: 'Add url to router',
          task: () => this.injectRouter(cwd + '/src/router.js', _.kebabCase(answers.name))
        }
      ]);

      // run the tasks
      tasks.run().then(() => {
        console.log('\n');
        if (!answers.page) {
          inquirer.prompt([{
            type: 'confirm',
            name: 'module',
            message: 'Install a new module?',
            default: true
          }]).then(ans => {
            if (ans.module) {
              console.log('\n\nModule Creation\n');
              const vue = new newModuleVue();
              vue.prompt(dir);
            }
          }).catch(err => console.log(err));
        } else {
          this.prompt(dir);
        }
      }).catch(err => console.log(err));
    })
    .catch(err => console.log(err))
  }
}

module.exports = VueBuilder;