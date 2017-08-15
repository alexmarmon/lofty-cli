const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const _ = require('lodash');
const Listr = require('listr');
const execa = require('execa');
const handlebars = require('handlebars');

class newModuleVue {
  // create prompt for new project
  prompt(dir = false, again = false) {
    let source = path.resolve('./', 'src/pages/');

    if (dir) {
      source = path.resolve('./', dir, 'src/pages/');
    }
    // get directories then prompt
    this.getDirectories(source).then((choices) => {
      // push shared_modules directory as an option
      choices.push('shared_modules');
      return (
        inquirer.prompt([{
          type: 'list',
          name: 'where',
          message: 'What page?',
          choices
        },{
          type: 'input',
          name: 'name',
          message: 'Module name?',
          default: () => ('new-module')
        },{
          type: 'confirm',
          name: 'page',
          message: 'Add another module?',
          default: false
        }]).then(answers => this.start(answers, dir))
        .catch(err => console.log(err))
      )
    })
  }

  getDirectories(source) {
    return new Promise(resolve => {
      resolve(fs.readdirSync(source));
    });
  }

  start(answers, dir) {
    // create current working directory const
    let cwd;
    let page;
    // if started from page creation
    if (answers.where === 'shared_modules' && dir) {
      console.log('haha');
      cwd = path.resolve('./', dir, 'src/shared_modules/');
      page = 'na';
    } else if (answers.where === 'shared_modules') {
      cwd = path.resolve('./', 'src/shared_modules/');
      page = 'na';
    } else if (dir) {
      cwd = path.resolve('./', dir, 'src/pages/', answers.where, 'modules/');
      page = path.resolve('./', dir, 'src/pages/', answers.where, answers.where);
    } else {
      cwd = path.resolve('./', 'src/pages/', answers.where, 'modules/');
      page = path.resolve('./', 'src/pages/', answers.where, answers.where);
    }

    // create tasks array
    const tasks = new Listr([
      {
        // create new directory
        title: 'Create dir',
        task: () => fs.ensureDir(path.join(cwd, _.kebabCase(answers.name))).then(() => console.log(path.join(cwd, _.kebabCase(answers.name))))
      },
      {
        // create .vue file
        title: 'Create vue file',
        task: () => this.buildFromTemplate(path.join(cwd, _.kebabCase(answers.name)), './templates/vue/new-module/new-module.vue', _.kebabCase(answers.name) + '.vue', answers)
      },
      {
        // create .scss file
        title: 'Create scss file',
        task: () => this.buildFromTemplate(path.join(cwd, _.kebabCase(answers.name)), './templates/vue/new-module/new-module.scss', _.kebabCase(answers.name) + '.scss', answers)
      },
      {
        // add module to page
        title: 'Add module to page',
        task: () => this.injectModule(page + '.vue', _.kebabCase(answers.name), answers.where === 'shared_modules' ? true : false)
      }
    ]);

    // run the tasks
    tasks.run().then(() => {
      console.log('\n');
      if (answers.page) {
        this.prompt(dir);
      }
    }).catch(err => console.log(err));
  }

  // create files using handlebars template
  buildFromTemplate(cwd, templatePath, newFilePath, data) {
    return new Promise(resolve => {
      fs.readFile(path.join(__dirname, '../', templatePath), 'utf8', (err, file) => {
        if (err) resolve(err);

        const template = handlebars.compile(file.toString());
        const fileWithVars = template(data);
        fs.writeFile(path.join(cwd, newFilePath), fileWithVars, (err) => resolve(cwd));
      });
    });
  }

  injectModule(file, name, shared) {
    return new Promise(resolve => {
      if (shared) {
        resolve();
      } else {
        fs.readFile(file, 'utf8', (err, data) => {

          // regex match for routes array
          let reg = new RegExp(/(?:script)[^]+(?=<\/script)/gm);
          let scriptTag = reg.exec(data);
          // split routes into array by new double line
          let imports = scriptTag[0].split('\n\n');
          let newImports;
          // push new import
          if (shared) {
            newImports = imports[0].concat('\nimport ' + _.upperFirst(_.camelCase(name)) + ' from \'../../shared_modules/' + name + '/' + name + '.vue\';');
          } else {
            newImports = imports[0].concat('\nimport ' + _.upperFirst(_.camelCase(name)) + ' from \'./modules/' + name + '/' + name + '.vue\';');
          }
          // add to import to ending
          imports[0] = newImports;
          // create temp file with imports
          const newScriptTag = imports.join('\n\n');
          const fileWithImport = data.replace(scriptTag, newScriptTag);


          // regex match for components object
          let reg2 = new RegExp(/(?:components)[^]+(?=\})/gm);
          let componentsObject = reg2.exec(fileWithImport);
          // split object into array, remove trailing "  }"
          let components = _.dropRight(_.compact(componentsObject[0].split('\n')));
          // add new component
          components.push('    \'' + name + '\': ' + _.upperFirst(_.camelCase(name)) + ',');
          // push ending "  }"
          components.push('  },\n');
          // join array by new line into string
          let newComponents = components.join('\n');
          // replace old routes string with new routes string
          const fileWithImportAndComponents = fileWithImport.replace(componentsObject, newComponents);


          // regex match for template pug
          let reg3 = new RegExp(/(?:template)[^]+(?=<\/template)/gm);
          let templatePug = reg3.exec(fileWithImportAndComponents);
          // split template pug by new line
          let templateComponents = _.compact(templatePug[0].split('\n'));
          // push new component
          templateComponents.push('    ' + name + '\n');
          // join array by new line into string
          let newTemplateComponents = templateComponents.join('\n');
          // replace old components with new
          const newFile = fileWithImportAndComponents.replace(templatePug, newTemplateComponents);


          // write file
          fs.writeFile(file, newFile, () => resolve());
        });
      }
    });
  }
}

module.exports = newModuleVue;
