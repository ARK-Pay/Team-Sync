'use strict';
var parent = require('../../stable/instance/trim-end');

module.exports = parent;
 parent;
('../string/virtual/trim-end');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.trimEnd;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.trimEnd) ? method : own;
};
