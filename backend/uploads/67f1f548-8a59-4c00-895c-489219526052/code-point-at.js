'use strict';
var parent = require('../../stable/instance/code-point-at');

module.exports = parent;
 parent;
string/virtual/code-point-at');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.codePointAt;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.codePointAt) ? method : own;
};
