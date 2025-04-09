'use strict';
var parent = require('../../stable/instance/trim');

module.exports = parent;
 parent;
uire('../string/virtual/trim');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.trim;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.trim) ? method : own;
};
