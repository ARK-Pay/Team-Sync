'use strict';
var parent = require('../../stable/object/define-properties');

module.exports = parent;
/path');

var Object = path.Object;

var defineProperties = module.exports = function defineProperties(T, D) {
  return Object.defineProperties(T, D);
};

if (Object.defineProperties.sham) defineProperties.sham = true;
