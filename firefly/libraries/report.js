const generateReport = (fileName, fileUrl, supportData) => {
  const report = generateTables(fileName, fileUrl, supportData);

  if (report.length > 1) {
    return report.join('\n');
  }

  return null;
};

const generateFeedbackMsg = feedback => {
  if (!feedback) {
    return '';
  }

  const {alternatives} = feedback;
  const {notes} = feedback;
  let feedbackMsg = '';

  if (alternatives && alternatives.length) {
    const part1 = ' Consider using ';
    const part2 = alternatives
      .map(alternative => {
        return Array.isArray(alternative) ?
          alternative.map(alternative => `'${alternative}'`).join(' with ') :
          `'${alternative}'`;
      })
      .join(', ')
      .replace(/, ([^,]*)$/, ' or $1');
    const part3 = ' instead.';
    feedbackMsg += part1 + part2 + part3;
  }

  if (notes && notes.length) {
    feedbackMsg += ` [Note]: ${notes}`;
  }

  return feedbackMsg;
};

const generateTableRow = (
  {name, location, notSupported, feedback},
  fileUrl
) => {
  const feedbackMsg = generateFeedbackMsg(feedback);
  const formatNotSupported = notSupported => {
    return notSupported.length <= 3 ?
      notSupported.join(', ').replace(/, ([^,]*)$/, ' & $1') :
      notSupported
        .slice(1, 4)
        .join(', ')
        .replace(/, ([^,]*)$/, ' & others');
  };

  return `✘ <a href="${fileUrl}#L${location.line}">[${location.line}:${
    location.column
  }]</a> ${formatNotSupported(
    notSupported
  )} does not support '${name}'.${feedbackMsg}`;
};

const generateTables = (fileName, fileUrl, supportData) => {
  const getHeading = {
    atRules: 'At-Rules',
    properties: 'Properties',
    mediaFeatures: 'Media Features'
  };

  return Object.entries(supportData).reduce(
    (acc, [statement, data]) => {
      const table = data
        .reduce((acc, property, index) => {
          if (index === 0) {
            acc.push(`####  ${getHeading[statement]} (${data.length})`);
            acc.push('<pre>');
          }

          acc.push(generateTableRow(property, fileUrl));
          if (index === data.length - 1) {
            acc.push('</pre>');
          }

          return acc;
        }, [])
        .join('\n');
      if (table.length) {
        acc.push(table);
      }

      return acc;
    },
    [`### Fail: [${fileName}](${fileUrl})`]
  );
};

module.exports = {
  generateReport
};
