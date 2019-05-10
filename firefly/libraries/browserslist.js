const browserslist = require('browserslist');

const {printEr} = require('../libraries/utils');

const getBrowserslist = usersBrowserslist => {
  try {
    return formatBrowserslist(browserslist(usersBrowserslist));
  } catch (error) {
    return printEr(`Unknown browser query "${usersBrowserslist.join(', ')}". `);
  }
};

const formatBrowserslist = browserslist => {
  /* eslint-disable camelcase */
  const browsersDictionary = {
    and_chr: 'chrome_android',
    and_ff: 'firefox_android',
    chrome: 'chrome',
    edge: 'edge',
    firefox: 'firefox',
    ie: 'ie',
    ios_saf: 'safari_ios',
    op_mob: 'opera_android',
    opera: 'opera',
    safari: 'safari',
    samsung: 'samsunginternet_android'
  };
  /* eslint-enable camelcase */

  return browserslist.reduce((acc, browser) => {
    const b = browser.split(' ');
    const browserName = b[0];
    let browserVersion = b[1];

    browserVersion = browserVersion.includes('-') ?
      browserVersion.split('-')[0] :
      browserVersion;

    if (browsersDictionary[browserName]) {
      acc[browsersDictionary[browserName]] = Number(browserVersion);
    }

    return acc;
  }, {});
};

module.exports = {
  getBrowserslist
};
