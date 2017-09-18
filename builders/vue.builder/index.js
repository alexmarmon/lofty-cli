const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const _ = require('lodash');
const Listr = require('listr');
const execa = require('execa');
const Builder = require('../builder');

class VueBuilder extends Builder{
  
  constructor(){
    super();    
    this.templateGitRepo = 'https://github.com/alexmarmon/14four-vue.git';
    this.templateFolder = path.join(__dirname, 'templates');
    this.frameworkName = 'Vue';
  }

  //
  // ────────────────────────────────────────────────────── I ──────────
  //   :::::: P R O J E C T : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────
  //
  // Generates a new Vue project. Must return a promise.
  project(){
    return new Promise(resolve => {
      super.project().then((data)=>{
        resolve(data);
      });
    });
  }

  //
  // ──────────────────────────────────────────────────── I ──────────
  //   :::::: M O D U L E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────
  //
  // Generates a new Vue module. Must return a promise.
  module(){
    return new Promise(resolve => {
      super.module().then((data)=>{
        resolve(data);
      });
    });
  }

  //
  // ──────────────────────────────────────────────── I ──────────
  //   :::::: P A G E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────
  //
  // Generates a new Vue page. Must return a promise.
  page(){
    return new Promise(resolve => {
      super.page().then((data) => {
        resolve(data);
      });
    });
    // const prompts = this.prompts.page;
    // inquirer.prompt(prompts).then((answers) => {
    //    // create current working directory const
    //   let cwd;
    //   // if started from project creation
    //   if (dir) {
    //     cwd = path.join('./', dir);
    //   // if started from within project
    //   } else {
    //     cwd = path.resolve('./');
    //   }

    //   // create tasks array
    //   const tasks = new Listr([
    //     {
    //       // create new directory
    //       title: 'Create dir',
    //       task: () => fs.ensureDir(path.join(cwd, '/src/pages/', _.kebabCase(answers.name)))
    //     },
    //     {
    //       // create page .vue file
    //       title: 'Create vue file',
    //       task: () => this.buildFromTemplate(path.join(cwd, '/src/pages/', _.kebabCase(answers.name)), './templates/vue/new-page/new-page.vue', _.kebabCase(answers.name) + '.vue', answers)
    //     },
    //     {
    //       // create modules folder
    //       title: 'Create modules folder',
    //       task: () => fs.ensureDir(path.join(cwd, '/src/pages/', _.kebabCase(answers.name), '/modules'))
    //     },
    //     {
    //       // add page to router
    //       title: 'Add url to router',
    //       task: () => this.injectRouter(cwd + '/src/router.js', _.kebabCase(answers.name))
    //     }
    //   ]);

    //   // run the tasks
    //   tasks.run().then(() => {
    //     console.log('\n');
    //     if (!answers.page) {
    //       inquirer.prompt([{
    //         type: 'confirm',
    //         name: 'module',
    //         message: 'Install a new module?',
    //         default: true
    //       }]).then(ans => {
    //         if (ans.module) {
    //           console.log('\n\nModule Creation\n');
    //           const vue = new newModuleVue();
    //           vue.prompt(dir);
    //         }
    //       }).catch(err => console.log(err));
    //     } else {
    //       this.prompt(dir);
    //     }
    //   }).catch(err => console.log(err));
    // })
    // .catch(err => console.log(err))
  }
}

module.exports = VueBuilder;