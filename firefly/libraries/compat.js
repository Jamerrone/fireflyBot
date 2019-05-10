const {
  'at-rules': AT_RULES,
  properties: PROPERTIES
} = require('../api/mdn-bcd');
const API = require('../api/firefly-alternatives');

const getAtruleSupportData = atrule => {
  try {
    return AT_RULES[atrule].__compat.support;
  } catch (error) {
    return false;
  }
};

const getPropertySupportData = property => {
  try {
    return PROPERTIES[property].__compat.support;
  } catch (error) {
    return false;
  }
};

const getMediaFeatureSupportData = mediaFeature => {
  try {
    return AT_RULES.media[mediaFeature].__compat.support;
  } catch (error) {
    return false;
  }
};

const getBrowserSupportData = (supportData, browser) => {
  let browserSupportData = Array.isArray(supportData[browser]) ?
    supportData[browser][0] :
    supportData[browser];

  try {
    browserSupportData = browserSupportData.version_added;
  } catch (error) {
    browserSupportData = null;
  }

  return browserSupportData;
};

const validateAlternative = (alternative, browserscope) => {
  const supportData = getPropertySupportData(alternative);
  return Object.entries(browserscope).every(([browser, version]) => {
    const bsd = getBrowserSupportData(supportData, browser);
    if (bsd === null) {
      return true;
    }

    return bsd && bsd <= version;
  });
};

const getPropertyFeedback = (property, browserscope) => {
  const feedback = API.properties[property];
  if (feedback && 'alternatives' in feedback) {
    feedback.alternatives = feedback.alternatives.filter(alternative =>
      Array.isArray(alternative) ?
        alternative.every(alternative =>
          validateAlternative(alternative, browserscope)
        ) :
        validateAlternative(alternative, browserscope)
    );
  }

  return feedback;
};

const formatData = ({browserscope, name, loc, supportData, feedback}) => {
  const {line, column} = loc.start;

  return Object.entries(browserscope).reduce((acc, [browser, version]) => {
    acc.name = name;
    acc.location = {line, column};
    acc.feedback = feedback || null;

    acc.supported = acc.supported || [];
    acc.notSupported = acc.notSupported || [];
    acc.unknown = acc.unknown || [];

    const bsd = getBrowserSupportData(supportData, browser);

    if (bsd === null) {
      acc.unknown.push(`${browser} ${version}`);
    } else if (bsd && bsd <= version) {
      acc.supported.push(`${browser} ${version}`);
    } else {
      acc.notSupported.push(`${browser} ${version}`);
    }

    return acc;
  }, {});
};

const checkBrowserSupport = (
  {atrules, declarations, mediaFeatures},
  browserscope
) => {
  return {
    atRules: atrules
      .reduce((acc, {name, loc}) => {
        const supportData = getAtruleSupportData(name);

        if (supportData) {
          acc.push(formatData({browserscope, name, loc, supportData}));
        }

        return acc;
      }, [])
      .filter(atrule => atrule.notSupported.length),
    properties: declarations
      .reduce((acc, {property, loc}) => {
        const supportData = getPropertySupportData(property);
        const feedback = getPropertyFeedback(property, browserscope);

        if (supportData) {
          acc.push(
            formatData({
              browserscope,
              name: property,
              loc,
              supportData,
              feedback
            })
          );
        }

        return acc;
      }, [])
      .filter(property => property.notSupported.length),
    mediaFeatures: mediaFeatures
      .reduce((acc, {name, loc}) => {
        const supportData = getMediaFeatureSupportData(
          name.replace(/^(min-)|(max-)/, '')
        );

        if (supportData) {
          acc.push(formatData({browserscope, name, loc, supportData}));
        }

        return acc;
      }, [])
      .filter(mediaFeature => mediaFeature.notSupported.length)
  };
};

module.exports = {
  checkBrowserSupport
};
