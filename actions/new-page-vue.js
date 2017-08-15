const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const _ = require('lodash');
const Listr = require('listr');
const execa = require('execa');
const handlebars = require('handlebars');
const newModuleVue = require('./new-module-vue');

class newPageVue {
  // create prompt for new project
  prompt(dir = false, again = false) {
    return (
      inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Page name?',
        default: () => ('new-page')
      },{
        type: 'confirm',
        name: 'page',
        message: 'Add another page?',
        default: false
      }]).then(answers => this.start(answers, dir))
      .catch(err => console.log(err))
    )
  }

  start(answers, dir) {
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
  }

  // create files using handlebars template
  buildFromTemplate(cwd, templatePath, newFilePath, data) {
    return new Promise(resolve => {
      fs.readFile(path.join(__dirname, '../', templatePath), 'utf8', (err, file) => {
        if (err) resolve(err);

        const template = handlebars.compile(file.toString());
        const fileWithVars = template(data);
        fs.writeFile(path.join(cwd, newFilePath), fileWithVars, (err) => resolve(err));
      });
    });
  }

  injectRouter(router, name) {
    return new Promise(resolve => {
      fs.readFile(router, 'utf8', (err, data) => {

        // regex match for routes array
        let reg = new RegExp(/(?:[routes:]*\[)[^]+(?=[\],])/gm);
        let routes = reg.exec(data);
        // split routes into array by new line, remove trailing "  ]"
        let routesArray = _.dropRight(routes[0].split('\n'));
        // push new route
        routesArray.push('    { path: \'/' + name + '\', component: ' + _.upperFirst(_.camelCase(name)) + ' },');
        // push ending "  ]"
        routesArray.push('  ]');
        // join array by new line into string
        let newRoutes = routesArray.join('\n');
        // replace old routes string with new routes string
        const newStuff = data.replace(routes, newRoutes);


        // split new file string on double new line
        let imports = newStuff.split('\n\n');
        // get first string in array which _should_ be string of imports
        let newImports = imports[0].concat('\nimport ' + _.upperFirst(_.camelCase(name)) + ' from \'./pages/' + name + '/' + name + '.vue\';');
        // add new import to end
        imports[0] = newImports;

        // join array back to string
        const newFile = imports.join('\n\n');

        // write file
        fs.writeFile(router, newFile, () => resolve());
      });
    });
  }
}

module.exports = newPageVue;
