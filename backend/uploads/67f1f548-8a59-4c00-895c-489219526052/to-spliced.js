'use strict';
var parent = require('../../../stable/array/virtual/to-spliced');
// TODO: Remove from `core-js@4`
require('../../../modules/esnext.array.to-spliced');

module.exports = parent;
 = function (it) {
  var own = it.toSpliced;
  return (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.toSpliced)) ? method : own;
};
