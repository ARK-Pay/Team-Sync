'use strict';
var parent = require('../../stable/instance/trim-right');

module.exports = parent;
 parent;
../string/virtual/trim-right');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.trimRight;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.trimRight) ? method : own;
};
