'use strict';
var parent = require('../../stable/instance/trim-start');

module.exports = parent;
 parent;
../string/virtual/trim-start');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.trimStart;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.trimStart) ? method : own;
};
