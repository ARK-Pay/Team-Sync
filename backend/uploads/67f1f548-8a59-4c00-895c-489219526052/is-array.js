'use strict';
var parent = require('../../stable/array/is-array');

module.exports = parent;
/path');

module.exports = path.Array.isArray;
 eslint-disable-next-line es/no-array-isarray -- safe
module.exports = Array.isArray || function isArray(argument) {
  return classof(argument) === 'Array';
};
