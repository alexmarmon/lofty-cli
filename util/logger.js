const chalk = require('chalk');


class Logger {
  constructor() {
    this.specialCharacters = this.getSpecialCharacters();
    this.conditionalLogs = false;
  }

  getSpecialCharacters = () => ({
    topRightCorner: '╗',
    bottomRightCorner: '╝',
    topLeftCorner: '╔',
    bottomLeftCorner: '╚',
    horizontalLine: '═',
    verticalLine: '║',
  })

  box(arg = {
    minWidth: 0, minHeight: 0, linesOfText: [], sidePadding: 0, verticalPadding: 0, padding: 0,
  }) {
    const sidePadding = arg.sidePadding || arg.padding || 0;
    const verticalPadding = arg.verticalPadding || arg.padding || 0;
    let verticalMiddle = 0;
    let lineStartPoint = 0;
    let returnString = '';
    const textQueue = arg.linesOfText ? JSON.parse(JSON.stringify(arg.linesOfText)) : [];

    // Find the height of the box
    let height = arg.minHeight || 0;
    if (arg.linesOfText && arg.linesOfText.length > height) {
      height = arg.linesOfText.length;
    }
    height += verticalPadding * 2;
    verticalMiddle = Math.floor(height / 2);
    lineStartPoint = (arg.linesOfText && arg.linesOfText.length > 0 ? verticalMiddle - (arg.linesOfText.length/2) : null);

    // Finde the width of the box (either the min width or the longest line of text)
    let width = arg.minWidth || 0;
    if (arg.linesOfText && arg.linesOfText.length > 0) {
      let longestLine = '';
      for (let i = 0; i < arg.linesOfText.length; i += 1) {
        if (arg.linesOfText[i].length > longestLine.length) {
          longestLine = arg.linesOfText[i];
        }
      }
      if (longestLine.length > width) {
        width = longestLine.length;
      }
    }
    width += sidePadding * 2;

    for (let i = 0; i < height; i += 1) {
      // Top
      if (i === 0) {
        returnString += this.line({ length: width, type: 'top' });
      }
      // Text
      else if (lineStartPoint && i >= lineStartPoint && i < lineStartPoint + arg.linesOfText.length && textQueue && textQueue.length > 0) {
        returnString += this.line({ length: width, type: 'sides', text: textQueue.shift() });
        returnString = chalk.bold(returnString);
      }
      // Bottom
      else if (i === height - 1) {
        returnString += this.line({ length: width, type: 'bottom' });
      }
      // Whitespace
      else {
        returnString += this.line({ length: width, type: 'sides' });
      }

      returnString += '\n';
    }

    return returnString;
  }

  // Type can be 'line', 'top', 'bottom', 'sides'
  line(arg = { length: 0, type: 'line', text: '' }) {
    let startChar = '';
    let endChar = '';
    let middleChar = '';
    let returnString = '';
    let charQueue = [];
    const midPointLine = Math.floor(arg.length / 2);
    let midPointText = 0;
    let textStartPoint = 0;

    // Figure out how to center the text in the line
    if (arg.text && arg.text.length > 0) {
      charQueue = arg.text.split('');
      midPointText = Math.floor(arg.text.length / 2);
      textStartPoint = midPointLine - midPointText;
    }

    if (arg.type === 'line') {
      startChar = this.specialCharacters.horizontalLine;
      middleChar = this.specialCharacters.horizontalLine;
      endChar = this.specialCharacters.horizontalLine;
    } else if (arg.type === 'top') {
      startChar = this.specialCharacters.topLeftCorner;
      middleChar = this.specialCharacters.horizontalLine;
      endChar = this.specialCharacters.topRightCorner;
    } else if (arg.type === 'bottom') {
      startChar = this.specialCharacters.bottomLeftCorner;
      middleChar = this.specialCharacters.horizontalLine;
      endChar = this.specialCharacters.bottomRightCorner;
    } else if (arg.type === 'sides') {
      startChar = this.specialCharacters.verticalLine;
      middleChar = ' ';
      endChar = this.specialCharacters.verticalLine;
    }

    for (let i = 0; i < arg.length; i += 1) {
      // Starting
      if (i === 0) {
        returnString += startChar;
      }
      // Ending
      else if (i === arg.length - 1) {
        returnString += endChar;
      }
      // Text
      else if (charQueue.length > 0 && i >= textStartPoint && i < textStartPoint + arg.text.length) {
        returnString += charQueue.shift();
      }
      // Filler
      else {
        returnString += middleChar;
      }
    }

    return returnString;
  }

  //
  // STRING CREATION
  //

  title = (string, numStars = 4) => (chalk.blue(chalk.bold(`${'*'.repeat(numStars)} ${string} ${'*'.repeat(numStars)}`)))

  error = string => (`🔥🔥 ${chalk.red(string)} 🔥🔥`)

  success = string => (`👍 ${chalk.green(string)}`)

  //
  // CONSOLE LOGGING
  //

  logTitle(string) { console.log(this.title(string)); }
  logError(string) { console.log(this.error(string)); }
  logSuccess(string) { console.log(this.success(string)); }

  conditionalLog(...strings) {
    if (this.conditionalLogs) {
      for (let i = 0; i < strings.length; i += 1) {
        if (i === 0) {
          console.log(strings[i]);
        } else {
          console.log(`\t${strings[i]}`);
        }
      }
    }
  }
}

module.exports = new Logger();
