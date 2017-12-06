const path = require('path');
const inquirer = require('inquirer');
const Listr = require('listr');
const execa = require('execa');
const _ = require('lodash');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const { Logger } = require('../util');

class Builder {
  constructor() {
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

  getFileNameInfoFromPath (pathName) {
    const pathArray = pathName.split('/');
    let fileName = '';
    let match = {};

    if (pathArray.length > 0) {
      fileName = pathArray[pathArray.length - 1];
      const fileRegex = /(.*)\.(.*)/;
      match = fileRegex.exec(fileName);
    }

    let fullName = '';
    let name = '';
    let extension = '';

    if (match) {
      if (match.length > 0) { fullName = match[0]; }
      if (match.length > 1) { name = match[1]; }
      if (match.length > 2) { extension = match[2]; }
    }

    return {
      fullName,
      name,
      extension,
    };
  }

  // Generates files from a handlebars template
  buildFromTemplate (cwd, templatePath, newFilePath, data) {
    return new Promise((resolve, reject) => {
      // Logger.conditionalLog(`**Building ${templatePath} to ${newFilePath}**`);
      Logger.conditionalLog(`Attempting to read ${templatePath}`);
      fs.readFile(templatePath, 'utf8', (err, file) => {
        const template = handlebars.compile(file.toString());
        const fileWithVars = template(data);
        const writePath = path.join(cwd, newFilePath);
        fs.outputFile(writePath, fileWithVars, (error) => {
          if (error) {
            reject(error);
          } else {
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
  buildFilesFromTemplate (templatePath, destPath, data, nameMaps) {
    return new Promise((resolve) => {
      this.getDirectories(templatePath).then((directories) => {
        let filesBuilt = 0;
        let directoriesBuilt = 0;

        // Get total number of files and directories inside folder
        let numDirectories = 0;
        let numFiles = 0;
        for (let i = 0; i < directories.length; i += 1) {
          const directory = directories[i];
          if (fs.lstatSync(path.join(templatePath, directory)).isDirectory()) {
            numDirectories += 1;
          } else if (fs.lstatSync(path.join(templatePath, directory)).isFile()) {
            numFiles += 1;
          }
        }

        // To make our lives easier for checking if we need to resolve
        function resolveIfNeeded() {
          if (filesBuilt === numFiles && directoriesBuilt === numDirectories) {
            resolve();
          }
        }

        for (let i = 0; i < directories.length; i += 1) {
          const directory = directories[i];

          // Skip over some useless files
          const filesToIgnore = ['.DS_Store', '.ttf'];
          let shouldSkipFile = false;
          for (let ignoreIndex = 0; ignoreIndex < filesToIgnore.length; ignoreIndex += 1) {
            if (directory.includes(filesToIgnore[ignoreIndex])) {
              Logger.logError(`Cannot build ${templatePath}/${directory}`);
              shouldSkipFile = true;
            }
          }

          // If we have a valid file
          if (!shouldSkipFile) {
            // Check if it's a file. If it is, we build the template
            if (fs.lstatSync(path.join(templatePath, directory)).isFile()) {
              let filename = directory;
              // Get the name and extension of the template file so we can map it to the corresponding name from nameMaps
              const fileInfo = this.getFileNameInfoFromPath(directory);
              if (nameMaps != null && nameMaps[fileInfo.name] && nameMaps[fileInfo.name].length > 0) {
                Logger.conditionalLog(`Replacing ${directory} name with ${fileInfo.name}`);
                // Use Regex to replace the template name with the new file name (maintaining the template extension)
                filename = filename.replace(fileInfo.fullName, `${nameMaps[fileInfo.name]}.${fileInfo.extension}`);
              }

              this.buildFromTemplate(destPath, path.join(templatePath, directory), filename, data)
                .then(() => { // eslint-disable-line
                  // Make sure we finish making all the files in the directory before resolving
                  filesBuilt += 1;
                  // console.log(`FILES: built ${filesBuilt} of ${numFiles}`);
                  // We don't want to resolve here if the directories above are going to resolve for us later
                  resolveIfNeeded();
                })
                .catch((error) => { Logger.logError(error); });
            }
            // Check if it's a folder. If it is, we need to be recursive
            else if (fs.lstatSync(path.join(templatePath, directory)).isDirectory()) {
              this.buildFilesFromTemplate(path.join(templatePath, directory), path.join(destPath, directory), data)
                .then(() => { // eslint-disable-line
                  directoriesBuilt += 1;
                  // console.log(`DIRECTORIES: built ${directoriesBuilt} of ${numDirectories}`);
                  resolveIfNeeded();
                });
            } else {
              Logger.logError(`${templatePath}/${directory} is not a file or directory`);
            }
          }
        }

        // If there's nothing in the folder, we still want to resolve
        if (directories.length === 0) {
          // console.log('resolving 0 directories');
          resolveIfNeeded();
        }
      });
    })
  }

  getDirectories = source => new Promise((resolve) => {
    resolve(fs.readdirSync(source));
  })

  // Generates a new project. Must be implemented by subclass.
  project () {
    return new Promise((resolve) => {
      // If you want to extend this project function, insert new prompts into `this.prompts.project`,
      //  which will update the questions asked and the `answers` variable.
      //  You can also call super.project().then((data)=>{}) in the subclass to do more actions after
      //  the initial project has been created.
      inquirer.prompt(this.prompts.project).then((answers) => {
        answers.framework = this.frameworkName;
        // Format the name of the project
        const projectName = _.kebabCase(answers.name);
        let projectDirectory = `./${answers.name}/`;

        if (answers.name === path.basename(path.resolve('./'))) {
          // scaffold into current folder
          projectDirectory = `./`;
        }

        // Create tasks array
        const tasks = new Listr([
          {
            // Create new directory
            title: `Create file tree for ${projectName}`,
            task: () => this.buildDefaultFileTree(projectDirectory),
          }, {
            title: 'Create project from template',
            task: () => {
              this.buildFilesFromTemplate(path.join(this.templateFolder, 'new-project'), projectDirectory, answers)
                .then(this.pageWithInfo({ name: 'Home' }, projectDirectory))
                .then(() => {
                  // If the subclass implements the 'injectRouter' method
                  if (typeof this.injectRouter === 'function') {
                    this.injectRouter(path.join(projectDirectory, this.fileTree.root.src.dir, '/routes.js'), 'Home', 'Home', '');
                  }
                });
            },
          },
        ]);

        // Run npm install if selection chosen
        if (answers.npm) {
          tasks.add({
            title: 'Npm install',
            task: () => execa('npm', ['install'], { cwd: path.resolve(projectDirectory) }),
          });
        }

        // Run the tasks
        tasks.run().then(() => {
          // Allow the subclass to extend the parent functionality
          resolve({ answers, name: projectName });
        }).catch(err => Logger.logError(err));
      });
    })
  }

  moduleWithInfo = data => new Promise((resolve) => {
    // Format the name of the module
    const moduleName = _.upperFirst(_.camelCase(data.name));
    data.name = _.kebabCase(data.name);
    Logger.conditionalLog(path.join(this.fileTree.root.src.modules, `/${data.name}/`));
    data.moduleName = moduleName;

    // Create tasks array
    const tasks = new Listr([
      {
        title: 'Create module from template',
        task: () => this.buildFilesFromTemplate(path.join(this.templateFolder, 'new-module'), `./${path.join(this.fileTree.root.src.modules, `/${moduleName}/`)}`, data, { 'new-module': `${moduleName}` }),
      },
    ]);

    // Run the tasks
    tasks.run().then(() => {
      // Allow the subclass to extend the parent functionality
      resolve({ answers: data, name: moduleName });
    }).catch(err => console.log(err));
  })

  // Generates a new module.
  module () {
    return new Promise((resolve) => {
      inquirer.prompt(this.prompts.module).then((answers) => {
        this.moduleWithInfo(answers);
        resolve();
      }).catch(err => console.log(err));
    })
  }

  // Create page without user prompts
  pageWithInfo = (data, projectRoot = '.') => new Promise((resolve) => {
    // Format the name of the module
    const pageName = _.upperFirst(_.camelCase(data.name));
    data.pageName = pageName;
    // Create tasks array
    const tasks = new Listr([
      {
        title: 'Create page from template',
        task: () => this.buildFilesFromTemplate(path.join(this.templateFolder, 'new-page'), `${projectRoot}/${this.fileTree.root.src.pages}`, data, { 'new-page': `${pageName}` }),
      },
    ]);

    // Run the tasks
    tasks.run().then(() => {
      // Allow the subclass to extend the parent functionality
      resolve({ answers: data, name: pageName });
    }).catch(err => console.log(err));
  })

  // Generates a new page using answers from user. Must be implemented by subclass.
  page () {
    return new Promise((resolve) => {
      inquirer.prompt(this.prompts.page).then((answers) => {
        this.pageWithInfo(answers).then((data) => {
          resolve(data);
        });
      }).catch(err => console.log(err));
    })
  }

  getFileTree = (root = '') => ({
    root: {
      dir: `${root}`,
      config: `${root}config/`,
      api: `${root}api/`,
      src: {
        dir: `${root}src/`,
        pages: `${root}src/pages/`,
        modules: `${root}src/modules/`,
        state: `${root}src/state/`,
        tests: `${root}src/tests/`,
        resources: {
          dir: `${root}src/resources/`,
          scripts: `${root}src/resources/scripts/`,
          styles: `${root}src/resources/styles/`,
          assets: {
            dir: `${root}src/resources/assets/`,
            fonts: `${root}src/resources/assets/fonts/`,
          },
        },
      },
    },
  })

  buildFileTree = (fileTreeObject) => {
    // This will happen synchronously so we don't run into any race conditions
    const keys = Object.keys(fileTreeObject);
    for (let i = 0; i < keys.length; i += 1) {
      const pathName = fileTreeObject[keys[i]];
      // If the pathName is a string, create the pathName
      if (typeof pathName === 'string') {
        if (!fs.existsSync(`${pathName}`)) {
          fs.mkdirSync(pathName);
          // Logger.logSuccess(`Created ${pathName}`);
        } else if (pathName !== './') {
          Logger.logError(`Directory ${pathName} already exists`);
        }
      }
      // Otherwise there are subdirectories
      else if (typeof pathName === 'object') {
        this.buildFileTree(pathName);
      }
    }
  }

  buildDefaultFileTree = (root = '/') => {
    const filetree = this.getFileTree(root);
    this.buildFileTree(filetree);
  }

  getPrompts = () => ({
    project: [
      {
        type: 'input',
        name: 'name',
        message: 'Project name?',
        default: () => path.basename(path.resolve('./')),
      }, {
        type: 'input',
        name: 'description',
        message: 'Project description?',
        default: () => ('new project'),
      }, {
        type: 'input',
        name: 'author',
        message: 'Project author?',
        default: () => ('author'),
      }, {
        type: 'input',
        name: 'repo',
        message: 'Project repository url?',
        default: () => (''),
      }, {
        type: 'input',
        name: 'port',
        message: 'Project port?',
        default: () => ('3000'),
      }, {
        type: 'confirm',
        name: 'npm',
        message: 'Run npm install?',
        default: true,
      },
    ],
    module: [
      {
        type: 'input',
        name: 'name',
        message: 'Module name?',
        default: () => ('new-module'),
      },
    ],
    page: [
      {
        type: 'input',
        name: 'name',
        message: 'Page name?',
        default: () => ('new-page'),
      },
    ],
  })
}

module.exports = Builder;
