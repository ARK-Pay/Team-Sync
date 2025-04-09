'use strict';
var parent = require('../../stable/instance/ends-with');

module.exports = parent;
 parent;
'../string/virtual/ends-with');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.endsWith;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.endsWith) ? method : own;
};
