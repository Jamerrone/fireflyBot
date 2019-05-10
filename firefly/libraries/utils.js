const chalk = require('chalk');

const printEr = (errorMessage, exitProgram = true) => {
  if (Array.isArray(errorMessage)) {
    errorMessage.forEach((message, index) => {
      if (index === 0) {
        console.error(`${chalk.red('Error:')} ${message}`);
      } else {
        console.error(`       ${message}`);
      }
    });
  } else {
    console.error(`${chalk.red('Error:')} ${errorMessage}`);
  }

  if (exitProgram) {
    process.exit();
  }
};

const printLn = message => {
  if (Array.isArray(message)) {
    message.forEach(msg => console.log(msg));
  } else {
    console.log(message);
  }
};

module.exports = {
  printEr,
  printLn
};
