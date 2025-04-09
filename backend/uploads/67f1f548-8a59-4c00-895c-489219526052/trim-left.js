'use strict';
var parent = require('../../stable/instance/trim-left');

module.exports = parent;
 parent;
'../string/virtual/trim-left');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.trimLeft;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.trimLeft) ? method : own;
};
