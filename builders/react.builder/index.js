const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const _ = require('lodash');
const Listr = require('listr');
const execa = require('execa');
const Builder = require('../builder');

class ReactBuilder extends Builder{
  
  constructor(){
    super();
    this.templateGitRepo = 'https://github.com/alexmarmon/react-mobx-template';
    this.templateFolder = path.join(__dirname, 'templates');
    this.frameworkName = 'React';
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
        // Inject the page info into the router
        // this.injectRouter(path.join('./', this.fileTree.root.src.dir, '/router.js'), data.answers.pageName);
        resolve(data);
      });
    });
  }
}

module.exports = ReactBuilder;