const path = require('path');
const fs = require('fs-extra');
const handlebars = require('handlebars');

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

    // This is the name of the project (should be kebab case)
    this.projectName = '';
  }

  // Generates files from a handlebars template
  buildFromTemplate(cwd, templatePath, newFilePath, data) {
    return new Promise(resolve => {
      fs.readFile(path.join(__dirname, '../', templatePath), 'utf8', (err, file) => {
        const template = handlebars.compile(file.toString());
        const fileWithVars = template(data);
        fs.writeFile(path.join(cwd, newFilePath), fileWithVars, () => resolve());
      });
    });
  }

  getDirectories(source) {
    return new Promise(resolve => {
      resolve(fs.readdirSync(source));
    });
  }

  // Generates a new project. Must be implemented by subclass.
  project(){
    console.warn('Not yet implemented by subclass');
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
          tests: `${root}/app/tests/`,
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
        fs.mkdirSync(path);
      }
      // Otherwise there are subdirectories
      else if(typeof path === 'object'){
        this.buildFileTree(path);
      }
    }
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