'use strict';
var parent = require('../../stable/instance/pad-end');

module.exports = parent;
 parent;
e('../string/virtual/pad-end');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.padEnd;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.padEnd) ? method : own;
};
