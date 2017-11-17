const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const Builder = require('../builder.js');

class VueBuilder extends Builder {
  constructor() {
    super();
    this.templateGitRepo = 'https://github.com/alexmarmon/14four-vue.git';
    this.templateFolder = path.join(__dirname, 'templates');
    this.frameworkName = 'Vue';
  }

  //
  // ────────────────────────────────────────────────────── I ──────────
  //   :::::: P R O J E C T : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────
  //
  // Generates a new Vue project. Must return a promise.
  project = () => new Promise((resolve) => {
    super.project().then((data) => {
      resolve(data);
    });
  })

  //
  // ──────────────────────────────────────────────────── I ──────────
  //   :::::: M O D U L E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────
  //
  // Generates a new Vue module. Must return a promise.
  module = () => new Promise((resolve) => {
    super.module().then((data) => {
      resolve(data);
    });
  })

  //
  // ──────────────────────────────────────────────── I ──────────
  //   :::::: P A G E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────
  //
  // Generates a new Vue page. Must return a promise.
  page = () => new Promise((resolve) => {
    super.page().then((data) => {
      // Inject the page info into the router
      this.injectRouter(path.join('./', this.fileTree.root.src.dir, '/router.js'), data.answers.pageName);
      resolve(data);
    });
  })

  injectRouter = (router, name) => new Promise((resolve, error) => {
    fs.readFile(router, 'utf8', (err, data) => {
      if (err) {
        // We had problems reading in the file
        error(err);
      } else {
        // regex match for routes array
        const reg = /(?:[routes:]*\[)[^]+(?=[\],])/;
        const routes = reg.exec(data);
        // split routes into array by new line, remove trailing "  ]"
        const routesArray = _.dropRight(routes[0].split('\n'));
        // push new route
        routesArray.push(`    { path: '/${name}', component: ${_.upperFirst(_.camelCase(name))} },`);
        // push ending "  ]"
        routesArray.push('  ]');
        // join array by new line into string
        const newRoutes = routesArray.join('\n');
        // replace old routes string with new routes string
        const newStuff = data.replace(routes, newRoutes);

        // split new file string on double new line
        const imports = newStuff.split('\n\n');
        // get first string in array which _should_ be string of imports
        const newImports = imports[0].concat(`\nimport ${_.upperFirst(_.camelCase(name))} from './pages/${name}.vue';`);
        // add new import to end
        imports[0] = newImports;

        // join array back to string
        const newFile = imports.join('\n\n');

        // write file
        fs.writeFile(router, newFile, () => resolve());
      }
    });
  })
}

module.exports = VueBuilder;
