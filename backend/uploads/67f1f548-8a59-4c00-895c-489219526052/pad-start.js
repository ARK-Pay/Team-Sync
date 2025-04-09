'use strict';
var parent = require('../../stable/instance/pad-start');

module.exports = parent;
 parent;
'../string/virtual/pad-start');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.padStart;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.padStart) ? method : own;
};
