'use strict';
var parent = require('../../stable/instance/starts-with');

module.exports = parent;
 parent;
./string/virtual/starts-with');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.startsWith;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.startsWith) ? method : own;
};
