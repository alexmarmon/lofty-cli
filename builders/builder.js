const path = require('path');
const inquirer = require('inquirer');
const Listr = require('listr');
const execa = require('execa');
const _ = require('lodash');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const Logger = require('../util/logger.js');

class Builder {

  constructor(){
    // Holds the general file structure of the project for consistency
    this.fileTree = this.getFileTree();

    // This prompt object can be extended or modified by the subclasses
    //  based on the needs of the project.
    this.prompts = this.getPrompts();

    // This is where the main project files come from (if the template relies on a git repo)
    this.templateGitRepo = '';

    // This is where the templates are stored for the builder
    this.templateFolder = '';

    // This is a flag for the CLI to use in order to determine the validity of the 
    //  builders being evaluated
    this.isBuilder = true;
  }

  // Generates files from a handlebars template
  buildFromTemplate(cwd, templatePath, newFilePath, data) {
    return new Promise((resolve, reject) => {
      fs.readFile(templatePath, 'utf8', (err, file) => {
        const template = handlebars.compile(file.toString());
        const fileWithVars = template(data);
        const writePath = path.join(cwd, newFilePath);
        fs.outputFile(writePath, fileWithVars, (error) => {
          if(error){
            reject(error);
          }else{
            resolve();
          }
        });
      });
    });
  }

  // Template path is the path to the folder containing templates (i.e. new-project, new-page, new-module... etc.)
  buildFilesFromTemplate(templatePath, destPath, data){  
    return new Promise(resolve => {
      this.getDirectories(templatePath).then((directories) => {
        for(let i = 0; i < directories.length; i++){
          const directory = directories[i];
          
          // Check if it's a folder. If it is, we need to be recursive
          if(fs.lstatSync(path.join(templatePath, directory)).isDirectory()){
            this.buildFilesFromTemplate(path.join(templatePath, directory), path.join(destPath, directory), data);
          }
          // Check if it's a file. If it is, we build the template
          else if(fs.lstatSync(path.join(templatePath, directory)).isFile()){
            this.buildFromTemplate(destPath, path.join(templatePath, directory), directory, data).catch((error)=>{
              console.log('error catch: ', error);
            })
          }
        }
        resolve();
      })
    })
  }

  getDirectories(source) {
    return new Promise(resolve => {
      resolve(fs.readdirSync(source));
    });
  }

  // Generates a new project. Must be implemented by subclass.
  project(){
    return new Promise((resolve)=>{
      inquirer.prompt(this.prompts.project).then((answers) => {
        // Format the name of the project
        const projectName = _.kebabCase(answers.name);
        // Create tasks array
        const tasks = new Listr([
          {
            // Create new directory
            title: `Create file tree for ${projectName}`,
            task: () => this.buildDefaultFileTree(projectName)
          },{
            title: 'Create files from template',
            task: () => this.buildFilesFromTemplate(path.join(this.templateFolder, 'new-project'), `./${projectName}`, answers)
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

        // Allow the subclass to extend the parent functionality
        resolve({answers: answers, projectName: projectName});
      })
    })
  }

  // Generates a new module. Must be implemented by subclass.
  module(){
    console.warn('Not yet implemented by subclass');
  }

  // Generates a new page. Must be implemented by subclass.
  page(){
    console.warn('Not yet implemented by subclass');
  }

  getFileTree(root = '/'){
    return {
      root: {
        dir: `${root}`,
        app: {
          dir: `${root}/app/`,
          pages: `${root}/app/pages/`,
          modules: `${root}/app/modules/`,
          state: `${root}/app/state/`,
          resources: {
            dir: `${root}/app/resources/`,
            scripts: `${root}/app/resources/scripts/`,
            assets: {
              dir: `${root}/app/resources/assets/`,
              styles: `${root}/app/resources/assets/styles/`,
              fonts: `${root}/app/resources/assets/fonts/`
            }
          },
        }
      }
    }
  }

  buildFileTree(fileTreeObject){
    // This will happen synchronously so we don't run into any race conditions
    const keys = Object.keys(fileTreeObject);
    for(let i = 0; i < keys.length; i++){
      const path = fileTreeObject[keys[i]];
      // If the path is a string, create the path
      if(typeof path === 'string' && path !== '/'){
        if(!fs.existsSync(`${path}`)){
          fs.mkdirSync(path);
          // Logger.logSuccess(`Created ${path}`);
        }else{
          Logger.logError(`Directory ${path} already exists`);
        }
      }
      // Otherwise there are subdirectories
      else if(typeof path === 'object'){
        this.buildFileTree(path);
      }
    }
  }

  buildDefaultFileTree(root = '/'){
    const filetree = this.getFileTree(root);
    this.buildFileTree(filetree);
  }

  getPrompts(){
    return {
      project: [
        {
          type: 'input',
          name: 'name',
          message: 'Project name?',
          default: () => ('new-project')
        },{
          type: 'input',
          name: 'description',
          message: 'Project description?',
          default: () => ('new project')
        },{
          type: 'input',
          name: 'author',
          message: 'Project author?',
          default: () => ('author')
        },{
          type: 'input',
          name: 'repo',
          message: 'Project repository url?',
          default: () => ('')
        },{
          type: 'input',
          name: 'port',
          message: 'Project port?',
          default: () => ('3000')
        },{
          type: 'confirm',
          name: 'npm',
          message: 'Run npm install?',
          default: false
        },{
          type: 'confirm',
          name: 'pages',
          message: 'Start page creation?',
          default: false
        }
      ],
      module: [
        {
          type: 'input',
          name: 'name',
          message: 'Module name?',
          default: () => ('new-module')
        },{
          type: 'confirm',
          name: 'page',
          message: 'Add another module?',
          default: false
        }
      ],
      page: [
        {
          type: 'input',
          name: 'name',
          message: 'Page name?',
          default: () => ('new-page')
        },{
          type: 'confirm',
          name: 'page',
          message: 'Add another page?',
          default: false
        }
      ],
    }
  }
}

module.exports = Builder;