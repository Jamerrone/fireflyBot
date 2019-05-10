const {getBrowserslist} = require('../libraries/browserslist');
const {checkBrowserSupport} = require('../libraries/compat');
const {getCSSStatements, parseCSS} = require('../libraries/css');
const {generateReport} = require('../libraries/report');

module.exports = (fileName, fileUrl, fileString) => {
  const parsedCSS = parseCSS(fileString);
  const cssStatements = getCSSStatements(parsedCSS);
  const browserscope = getBrowserslist('defaults');
  const browserSupport = checkBrowserSupport(cssStatements, browserscope);
  const generatedReport = generateReport(fileName, fileUrl, browserSupport);
  return generatedReport;
};
