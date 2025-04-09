'use strict';
var parent = require('../../stable/instance/repeat');

module.exports = parent;
 parent;
re('../string/virtual/repeat');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.repeat;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.repeat) ? method : own;
};
