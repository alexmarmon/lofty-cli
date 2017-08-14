const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const _ = require('lodash');
const Listr = require('listr');
const execa = require('execa');
const handlebars = require('handlebars');

class newProjectVue {
  // create prompt for new project
  prompt() {
    return (
      inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Project name?',
        default: () => ('new-project')
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description?',
        default: () => ('new project')
      },
      {
        type: 'input',
        name: 'author',
        message: 'Project author?',
        default: () => ('author')
      },
      {
        type: 'input',
        name: 'port',
        message: 'Project port?',
        default: () => ('3000')
      },
      {
        type: 'confirm',
        name: 'npm',
        message: 'Run npm install?',
        default: false
      },
      {
        type: 'confirm',
        name: 'pages',
        message: 'Start page creation?',
        default: false
      }]).then(answers => this.start(answers))
      .catch(err => console.log(err))
    )
  }

  start(answers) {
    // create current working directory const
    const cwd = path.resolve('../' + _.kebabCase(answers.name));

    // create data object from responses
    const data = {
      'project-name': answers.name,
      'project-description': answers.description,
      'project-author': answers.author,
      'project-port': answers.port
    };

    // create tasks array
    const tasks = new Listr([
      {
        // create new directory
        title: 'Create dir',
        task: () => fs.ensureDir(cwd)
      },
      {
        // clone vue template into new directory
        // pass cwd option to specify where execa should execute
        title: 'Git clone',
        task: () => execa('git', ['clone', 'https://github.com/alexmarmon/vue-vuex-template', cwd], {cwd})
      },
      {
        // add responses to package.json
        title: 'Inject package.json',
        task: () => this.buildFromTemplate(cwd, './templates/vue/package.json', 'package.json', data)
      },
      {
        // add responses to readme
        title: 'Inject readme',
        task: () => this.buildFromTemplate(cwd, './templates/vue/README.md', 'README.md', data)
      }
    ]);

    // run npm install if selection chosen
    if (answers.npm) {
      tasks.add({
        title: 'Npm install',
        task: () => execa('npm', ['install'], {cwd: path.resolve('../' + _.kebabCase(answers.name))})
      });
    }

    // run the tasks
    tasks.run().catch(err => console.log(err));
  }

  // create files using handlebars templates
  buildFromTemplate(cwd, templatePath, newFilePath, data) {
    return new Promise(resolve => {
      console.log(templatePath);
      console.log(newFilePath);
      console.log(cwd);
      fs.readFile(path.resolve(templatePath), 'utf8', (err, file) => {
        const template = handlebars.compile(file.toString());
        const fileWithVars = template(data);
        fs.writeFile(path.join(cwd, newFilePath), fileWithVars, () => resolve());
      });
    });
  }
}

module.exports = newProjectVue;
