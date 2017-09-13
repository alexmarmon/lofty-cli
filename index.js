#!/usr/bin/env node

const inquirer = require('inquirer');
const newProjectVue = require('./actions/new-project-vue');
const newPageVue = require('./actions/new-page-vue');
const newModuleVue = require('./actions/new-module-vue');
const Builder = require('./actions/react.builder.js');

let builder = new Builder();
builder.project();
// builder.page();


// // greeting
// console.log('\n\nWelcome to the Lofty CLI!\n\n')

// inquirer.prompt({
//   type: 'list',
//   name: 'main',
//   message: 'What would you like to do?',
//   choices: [
//     'Create a new project',
//     'Create a new page',
//     'Create a new module',
//     'Push a new stage',
//     'Update a current stage',
//     'Show help',
//     'Exit'
//   ]
// }).then((answer) => {
//   // create a new project
//   if (answer.main === 'Create a new project') {
//     getFramework().then(which => {
//       if (which === 'Vue') {
//         const vue = new newProjectVue();
//         vue.prompt();
//       } else if (which === 'React') {
//         console.log('not setup yet, nerd.');
//       }
//     });
//   }

//   // create a new page
//   if (answer.main === 'Create a new page') {
//     getFramework().then(which => {
//       if (which === 'Vue') {
//         const vue = new newPageVue();
//         vue.prompt();
//       } else if (which === 'React') {
//         console.log('not setup yet, nerd.');
//       }
//     })
//   }

//   // create a new module
//   if (answer.main === 'Create a new module') {
//     getFramework().then(which => {
//       if (which === 'Vue') {
//         const vue = new newModuleVue();
//         vue.prompt();
//       } else if (which === 'React') {
//         console.log('not setup yet, nerd.');
//       }
//     })
//   }
// });

// // function to prompt user for framework
// function getFramework() {
//   return new Promise((resolve) => {
//     inquirer.prompt({
//       type: 'list',
//       name: 'which',
//       message: 'With which framework?',
//       choices: ['Vue', 'React']
//     }).then((ans) => resolve(ans.which));
//   });
// }
