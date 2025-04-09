'use strict';
require('../../../modules/esnext.array.find-last');
var parent = require('../../../stable/array/virtual/find-last');

module.exports = parent;
= Array.prototype;

module.exports = function (it) {
  var own = it.findLast;
  return it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.findLast) ? method : own;
};
