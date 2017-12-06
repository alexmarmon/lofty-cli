const inquirer = require('inquirer');
const Listr = require('listr');

/**
 * [Command class definition to be extended by commands]
 */
class Command {
  /**
   * [run description]
   * Call this from the commands index file
   * @return {[ Promise ]} [ Resolves after all steps are complete ]
   */
  run = () => new Promise(resolve => {
    this.commandWillRun()
    .then(() => this.prompt())
    .then(answers => this.setupTasks(answers))
    .then(listrTasks => this.runTasks(listrTasks))
    .then(() => this.commandDidRun())
    .then(() => resolve())
  })

  /**
   * [prompts description]
   * Override in your command class
   * @return {[ Array ]} [ The array should contain objects with this syntax:
   *                       https://github.com/SBoudrias/Inquirer.js/#objects ]
   */
  prompts = () => [{}]

  /**
   * [prompt description]
   * Using prompt objects from the function above, this will
   * get responses from the user
   * @return {[ Promise ]} [ Resolves after questions have been answered ]
   */
  prompt = () => new Promise(resolve => {
    inquirer.prompt(this.prompts()).then(answers => resolve(answers))
  })

  /**
   * [tasks description]
   * Override in your command class
   * @param  {[ Object ]} answers [ object containing answers from your prompts,
   *                                these can be used in your tasks ]
   * @return {[ Array ]}          [ The array should contain objects with this syntax:
   *                                https://github.com/SamVerschueren/listr#usage ]
   */
  tasks = answers => [{}]

  /**
   * [setupTasks description]
   * This passes your defined tasks to a Listr instance
   * @param  {[ Object ]} answers [ object containing answers from your prompts,
   *                                these are passed to the function above so
   *                                you can use them in your tasks ]
   * @return {[ Listr Instance ]}  [ https://github.com/SamVerschueren/listr ]
   */
  setupTasks = answers => new Listr( this.tasks(answers) )

  /**
   * [runTasks description]
   * This runs your tasks in order
   * @param  {[ Listr Instance ]} listrTasks [ https://github.com/SamVerschueren/listr ]
   * @return {[ Promise ]}                   [ resolves after tasks are run ]
   */
  runTasks = listrTasks => new Promise(resolve => {
    listrTasks.run().then(() => resolve()).catch(err => {/* console.log(err) */})
  })

  /**
   * [commandWillRun description]
   * Lifecycle hook that runs before the user is prompted,
   * Override this in your command if necessary
   * @return {[ Promise ]} [ Function to be run ]
   */
  commandWillRun = () => new Promise(resolve => resolve())

  /**
   * [commandDidRun description]
   * Lifecycle hook that runs after the tasks have been completed
   * Override this in your command if necessary
   * @return {[ Promise ]} [ Function to be run ]
   */
  commandDidRun = () => new Promise(resolve => resolve())
}

module.exports = Command;
