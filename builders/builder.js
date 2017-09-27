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

    // This refers to the current framework the project is using
    this.frameworkName = '';
  }

  getFileNameInfoFromPath(path){
    let pathArray = path.split('/');
    let fileName = '';
    let match = {}

    if(pathArray.length > 0){
      fileName = pathArray[pathArray.length - 1];
      const fileRegex = /(.*)\.(.*)/;
      match = fileRegex.exec(fileName);
    }

    let fullName = '';
    let name = '';
    let extension = '';

    if(match){
      if(match.length > 0){ fullName = match[0]; }
      if(match.length > 1){ name = match[1]; }
      if(match.length > 2){ extension = match[2]; }
    }

    return {
      fullName: fullName,
      name: name,
      extension: extension
    }
  }

  // Generates files from a handlebars template
  buildFromTemplate(cwd, templatePath, newFilePath, data) {
    // Logger.conditionalLog(`**Building ${templatePath} to ${newFilePath}**`);
    return new Promise((resolve, reject) => {
      Logger.conditionalLog(`Attempting to read ${templatePath}`);
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

  // @param Template path is the path to the folder containing templates (i.e. new-project, new-page, new-module... etc.)
  // @param nameMaps is an object that maps the template file name to the filename that you want.
  //  For example, if the template file name is `new-file.js` and you want it to be called `my-file.js`,
  //  pass in the object {'new-file': 'my-file'}, and it will rename the file, maintaining the extension.
  //  Otherwise, the files will maintain the same names as the template files
  buildFilesFromTemplate(templatePath, destPath, data, nameMaps){
    return new Promise(resolve => {
      this.getDirectories(templatePath).then((directories) => {
        Logger.conditionalLog(`Directories in ${templatePath}: ${directories}`);

        for(let i = 0; i < directories.length; i++){
          const directory = directories[i];
          Logger.conditionalLog(`Reading ${directory}`);

          // Skip over some useless files
          const filesToIgnore = ['.DS_Store', '.ttf', ];
          let shouldSkipFile = false;
          for(let ignoreIndex = 0; ignoreIndex < filesToIgnore.length; ignoreIndex++) {
            if (directory.includes(filesToIgnore[ignoreIndex])){
              Logger.logError(`Cannot build ${templatePath}/${directory}`);
              shouldSkipFile = true;
            }
          }
          // If we have a valid file
          if(!shouldSkipFile){
            // Check if it's a folder. If it is, we need to be recursive
            if(fs.lstatSync(path.join(templatePath, directory)).isDirectory()){
              this.buildFilesFromTemplate(path.join(templatePath, directory), path.join(destPath, directory), data);
            }
            // Check if it's a file. If it is, we build the template
            else if(fs.lstatSync(path.join(templatePath, directory)).isFile()){
              let filename = directory;
              // Get the name and extension of the template file so we can map it to the corresponding name from nameMaps
              const fileInfo = this.getFileNameInfoFromPath(directory);
              if(nameMaps != null && nameMaps[fileInfo.name] && nameMaps[fileInfo.name].length > 0){
                Logger.conditionalLog(`Replacing ${directory} name with ${fileInfo.name}`);
                // Use Regex to replace the template name with the new file name (maintaining the template extension)
                filename = filename.replace(fileInfo.fullName, `${nameMaps[fileInfo.name]}.${fileInfo.extension}`);
              }

              this.buildFromTemplate(destPath, path.join(templatePath, directory), filename, data).catch((error)=>{
                Logger.logError(error);
              });
            } else {
              Logger.logError(`${templatePath}/${directory} is not a file`);
            }
          }
        }
        resolve();
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
    // If you want to extend this project function, insert new prompts into `this.prompts.project`,
    //  which will update the questions asked and the `answers` variable.
    //  You can also call super.project().then((data)=>{}) in the subclass to do more actions after
    //  the initial project has been created.
    return new Promise((resolve)=>{
      inquirer.prompt(this.prompts.project).then((answers) => {
        Logger.conditionalLog('Retrieved answers from project');
        answers.framework = this.frameworkName;
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
          // Allow the subclass to extend the parent functionality
          resolve({answers: answers, name: projectName});
        }).catch(err => Logger.logError(err));
      });
    });
  }

  // Generates a new module.
  module(){
    return new Promise((resolve) => {
      inquirer.prompt(this.prompts.module).then((answers) => {
        // Format the name of the module
        const moduleName = _.upperFirst(_.camelCase(answers.name));
        answers.name = _.kebabCase(answers.name);
        Logger.conditionalLog(path.join(this.fileTree.root.src.modules, `/${answers.name}/`));
        answers.moduleName = moduleName;

        // Create tasks array
        const tasks = new Listr([
          {
            title: 'Create files from template',
            task: () => this.buildFilesFromTemplate(path.join(this.templateFolder, 'new-module'), `./${path.join(this.fileTree.root.src.modules, `/${moduleName}/`)}`, answers, {'new-module': `${moduleName}`})
          }
        ]);

        // Run the tasks
        tasks.run().then(() => {
          // Allow the subclass to extend the parent functionality
          resolve({answers: answers, name: moduleName});
        }).catch(err => console.log(err));
      }).catch(err => console.log(err));
    });
  }

  // Generates a new page. Must be implemented by subclass.
  page(){
    return new Promise((resolve) => {
      inquirer.prompt(this.prompts.page).then((answers) => {
        // Format the name of the module
        const pageName = _.upperFirst(_.camelCase(answers.name));
        answers.pageName = pageName;
        // Create tasks array
        const tasks = new Listr([
          {
            title: 'Create files from template',
            task: () => this.buildFilesFromTemplate(path.join(this.templateFolder, 'new-page'), `./${this.fileTree.root.src.pages}`, answers, {'new-page': `${pageName}`})
          }
        ]);

        // Run the tasks
        tasks.run().then(() => {
          // Allow the subclass to extend the parent functionality
          resolve({answers: answers, name: pageName});
        }).catch(err => console.log(err));
      }).catch(err => console.log(err));
    });
  }

  getFileTree(root = ''){
    return {
      root: {
        dir: `${root}`,
        tests: `${root}/tests/`,
        config: `${root}/config/`,
        api: `${root}/api/`,
        src: {
          dir: `${root}/src/`,
          pages: `${root}/src/pages/`,
          modules: `${root}/src/modules/`,
          state: `${root}/src/state/`,
          resources: {
            dir: `${root}/src/resources/`,
            scripts: `${root}/src/resources/scripts/`,
            styles: `${root}/src/resources/styles/`,
            assets: {
              dir: `${root}/src/resources/assets/`,
              fonts: `${root}/src/resources/assets/fonts/`
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
          default: true
        }
      ],
      module: [
        {
          type: 'input',
          name: 'name',
          message: 'Module name?',
          default: () => ('new-module')
        }
      ],
      page: [
        {
          type: 'input',
          name: 'name',
          message: 'Page name?',
          default: () => ('new-page')
        }
      ],
    }
  }
}

module.exports = Builder;