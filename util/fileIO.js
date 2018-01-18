const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

class FileIO {
  getDirectories = source => new Promise((resolve) => {
    resolve(fs.readdirSync(source));
  })

  /**
   * [getTemplatePath description]
   * @param  {[ String ]} which [ one of 'new-module', 'new-page', or 'new-project' ]
   * @return {[ String ]}       [ path to specific template ]
   */
  getTemplatePath = (which) => path.join(__dirname, '../builders/vue.builder/templates', which)

  /**
   * [writeTemplateFile description]
   * Use this function to create a file from a template
   * @param  {[ String ]} templatePath [ where the template exists ]
   * @param  {[ String ]} writePath    [ where to write the new file ]
   * @param  {[ Object ]} templateData [ typically you will send this your answers responses ]
   */
  writeTemplateFile = (templatePath, writePath, templateData) => {
    fs.readFile(templatePath, 'utf8', (err, data) => {
      if (err) console.log(err);
      const compiled = _.template(data);
      fs.outputFile(writePath, compiled(templateData), (err) => {
        if (err) console.log(err);
      })
    })
  }
}

module.exports = new FileIO();
