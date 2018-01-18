const fs = require('fs-extra');
const chalk = require('chalk');
const inquirer = require('inquirer');
const cmd = require('node-cmd');
const exec = require('ssh-exec');
const Listr = require('listr');
const { ProjectInfo } = require('../util');

class UpdateStage {
  run = (message = '') => new Promise((resolve) => {
    inquirer.prompt({
      when: () => !(message.length > 0),
      type: 'input',
      name: 'msg',
      message: 'Git message',
    }).then((answer) => {
      const tasks = new Listr([
        {
          // run latest build
          title: 'Run latest build',
          skip: () => (message.length > 0 ? 'already built' : false),
          task: (ctx, task) => new Promise((res, rej) => { // eslint-disable-line
            console.log(task);
            task.output = 'running latest build...';
            this.runLatestBuild()
              .then(() => res('runLatestBuild: success')).catch(e => rej(new Error(e)));
          }),
        }, {
          // Push changes to git
          title: 'Push local changes to git',
          skip: () => (message.length > 0 ? 'already pushed' : false),
          task: () => new Promise((res, rej) => {
            this.pushChangesToGit(answer.msg)
              .then(() => res('pushChangesToGit: success')).catch(e => rej(new Error(e)));
          }),
        }, {
          // get ssh creds
          title: 'Look for SSH creds',
          task: ctx => new Promise((res, rej) => {
            this.checkSSHCreds().then(({ user, host, keyPath }) => {
              ctx.user = user;
              ctx.host = host;
              ctx.keyPath = keyPath;
              res('checkSSHCreds: sucess');
            }).catch(e => rej(new Error(e)));
          }),
        }, {
          // pull changes on server
          title: 'Pull changes on server',
          task: ctx => new Promise((res, rej) => {
            this.pullChangesOnServer({ user: ctx.user, host: ctx.host, keyPath: ctx.keyPath })
              .then(() => res('pullChangesOnServer: success'))
              .catch(e => rej(new Error(e)));
          }),
        }, {
          // run npm install again incase new dependencies
          title: 'Run npm install on server',
          task: ctx => new Promise((res, rej) => {
            this.runNpmInstallOnServer({ user: ctx.user, host: ctx.host, keyPath: ctx.keyPath })
              .then(() => res('runLatestBuild: success')).catch(e => rej(new Error(e)));
          }),
        }, {
          // update pm2 process on server
          title: 'Update pm2 process',
          task: ctx => new Promise((res, rej) => {
            this.updatePM2Process({ host: ctx.host, keyPath: ctx.keyPath })
              .then(() => res('updatePM2Process: success'))
              .catch(e => rej(new Error(e)));
          }),
        },
      ]);

      // Run the tasks
      tasks.run({ user: '', host: '', keyPath: '' }).then(() => {
        projectInfo.get().then((info) => {
          console.log(`\n\nChanges are live at: ${chalk.blue(`${info.name}.thatslofty.com`)}\n\n`);
          resolve();
        });
      }).catch((err) => {
        if (err.toString() === 'Error: creds.json file does not exist' || err.toString() === 'Error: creds.json file is empty') {
          console.log(`
    Looks like there was an error with your creds.json file, lets get that fixed.
    Here is an example of what the file should contain:
    ${chalk.blue('{"user":"username","host":"ec2-##-###-###-###.us-xxxx-#.compute.amazonaws.com","path":"/Users/username/.ssh/id_rsa"}')}
          `);
          this.writeSSHCreds().then(() => this.run(answer.message));
        }
      });
    });
  })

  writeSSHCreds = (user = '', host = '', keyPath = '') => new Promise((resolve) => {
    // create host and current user
    const newCreds = {
      user,
      host,
      keyPath,
    };
    // build questions array
    const questions = [];
    if (newCreds.user === '') {
      questions.push({
        type: 'input',
        name: 'user',
        message: 'User?',
        default: () => ('user'),
      });
    }
    if (newCreds.host === '') {
      questions.push({
        type: 'input',
        name: 'host',
        message: 'Host?',
        default: () => ('ec2-**-***-***-***.us-****-*.compute.amazonaws.com'),
      });
    }
    if (newCreds.keyPath === '') {
      questions.push({
        type: 'input',
        name: 'keyPath',
        message: 'Path to private key',
        default: () => ('/Users/user/.ssh/id_rsa'),
      });
    }
    // prompt for responses
    inquirer.prompt(questions).then((answers) => {
      if (newCreds.user === '') { newCreds.user = answers.user; }
      if (newCreds.host === '') { newCreds.host = answers.host; }
      if (newCreds.keyPath === '') { newCreds.keyPath = answers.keyPath; }
      // write file for next time
      fs.writeFileSync(`${__dirname}/creds.json`, JSON.stringify(newCreds));
      // resolve promise with creds
      resolve({ user: newCreds.user, host: newCreds.host, keyPath: newCreds.keyPath });
    });
  })

  checkSSHCreds = () => new Promise((resolve, reject) => {
    if (fs.existsSync(`${__dirname}/creds.json`)) {
      // check for host and current user
      const creds = JSON.parse(fs.readFileSync(`${__dirname}/creds.json`));
      if (!creds.user && !creds.host && !creds.path) {
        // neither exist
        reject('creds.json file is empty');
      } else {
        // all exist, continue.
        resolve({ user: creds.user, host: creds.host, keyPath: creds.path });
      }
    } else {
      reject('creds.json file does not exist');
    }
  })

  runLatestBuild = () => new Promise((resolve) => {
    cmd.get('npm run build', () => {
      resolve();
    });
  })

  pushChangesToGit = msg => new Promise((resolve) => {
    cmd.get('git add .', () => {
      cmd.get(`git commit -m "${msg}"`, () => {
        cmd.get('git push', () => {
          resolve();
        });
      });
    });
  })

  pullChangesOnServer = ({ user, host, keyPath }) => new Promise((resolve) => {
    projectInfo.get().then((info) => {
      const command = `cd /home/sites/${info.name}; git pull`;
      exec(command, { user, host, privateKey: fs.readFileSync(keyPath) }, () => {
        resolve();
      });
    });
  })

  runNpmInstallOnServer = ({ user, host, keyPath }) => new Promise((resolve) => {
    projectInfo.get().then((info) => {
      const command = `cd /home/sites/${info.name}; npm install`;
      exec(command, { user, host, privateKey: fs.readFileSync(keyPath) }, () => {
        resolve();
      });
    });
  })

  updatePM2Process = ({ host, keyPath }) => new Promise((resolve, reject) => {
    projectInfo.get().then((info) => {
      const command = `pm2 restart ${info.name}`;
      exec(command, { user: 'pm2', host, privateKey: fs.readFileSync(keyPath) }, () => {
        if (stderr.length > 1) {
          reject(stderr);
        } else {
          resolve();
        }
      });
    });
  })
}

module.exports = new UpdateStage();
