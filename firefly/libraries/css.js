const csstree = require('css-tree');

const getCSSStatements = cssNode => {
  const statements = {atrules: [], declarations: [], mediaFeatures: []};
  csstree.walk(cssNode, {
    enter(node) {
      if (node.type === 'Atrule') {
        statements.atrules.push(node);
      }

      if (node.type === 'Declaration') {
        statements.declarations.push(node);
      }

      if (node.type === 'MediaFeature') {
        statements.mediaFeatures.push(node);
      }
    }
  });
  return statements;
};

const parseCSS = fileString => {
  const parsedCSS = csstree.parse(fileString, {
    parseValue: false,
    positions: true
  });
  return parsedCSS;
};

module.exports = {
  getCSSStatements,
  parseCSS
};
