'use strict';
var parent = require('../../../stable/array/virtual/to-reversed');
// TODO: Remove from `core-js@4`
require('../../../modules/esnext.array.to-reversed');

module.exports = parent;
= function (it) {
  var own = it.toReversed;
  return (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.toReversed)) ? method : own;
};
