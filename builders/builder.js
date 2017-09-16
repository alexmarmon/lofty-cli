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

    // This is where the main project files come from
    this.templateGitRepo = '';

    // This is a flag for the CLI to use in order to determine the validity of the 
    //  builders being evaluated
    this.isBuilder = true;
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

  getFileTree(){
    return {
      root: {
        dir: '/',
        app: {
          dir: 'app/',
          pages: 'app/pages/',
          modules: 'app/modules/',
        }
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