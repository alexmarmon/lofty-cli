const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const Builder = require('../builder.js');

class ReactBuilder extends Builder {
  constructor() {
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
  // Generates a new React project. Must return a promise.
  project = () => new Promise((resolve) => {
    console.log('react project');
    console.log(super.project);
    super.project().then((data) => {
      resolve(data);
    });
  })

  //
  // ──────────────────────────────────────────────────── I ──────────
  //   :::::: M O D U L E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────
  //
  // Generates a new React module. Must return a promise.
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
  // Generates a new React page. Must return a promise.
  page = () => new Promise((resolve) => {
    super.page().then((data) => {
      console.log('injecting router');
      // Inject the page info into the router
      this.injectRouter(path.join('./', this.fileTree.root.src.dir, '/routes.jsx'), data.answers.name, data.answers.pageName, data.answers.path);
      resolve(data);
    });
  })

  injectRouter = (router, name, pageName, pathName) => new Promise((resolve, error) => {
    fs.readFile(router, 'utf8', (err, data) => {
      if (err) {
        // We had problems reading in the file
        error(err);
      } else {
        if (pathName == null && pathName !== '') {
          pathName = name;
        }
        // regex match for routes array
        const reg = /(?:[routes:]*\[)[^]+(?=[\],])/;
        const routes = reg.exec(data);
        // split routes into array by new line, remove trailing "  ]"
        const routesArray = _.dropRight(routes[0].split('\n'));
        // push new route
        routesArray.push(`        <Route exact path="/${pathName}" key="${name}" component={() => <${pageName} state={appState} />} />,`);
        // push ending "  ]"
        routesArray.push('      ]');
        // join array by new line into string
        const newRoutes = routesArray.join('\n');
        // replace old routes string with new routes string
        const newStuff = data.replace(routes, newRoutes);

        // split new file string on double new line
        const imports = newStuff.split('\n\n');
        // get first string in array which _should_ be string of imports
        const newImports = imports[0].concat(`\nimport ${pageName} from './pages/${pageName}';`);
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

module.exports = ReactBuilder;
