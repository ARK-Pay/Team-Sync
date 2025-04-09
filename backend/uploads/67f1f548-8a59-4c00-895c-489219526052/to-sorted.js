'use strict';
var parent = require('../../../stable/array/virtual/to-sorted');
// TODO: Remove from `core-js@4`
require('../../../modules/esnext.array.to-sorted');

module.exports = parent;
s = function (it) {
  var own = it.toSorted;
  return (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.toSorted)) ? method : own;
};
