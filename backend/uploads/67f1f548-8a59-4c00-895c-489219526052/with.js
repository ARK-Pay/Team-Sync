'use strict';
var parent = require('../../../stable/array/virtual/with');
// TODO: Remove from `core-js@4`
require('../../../modules/esnext.array.with');

module.exports = parent;
xports = function (it) {
  var own = it['with'];
  return (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype['with'])) ? method : own;
};
