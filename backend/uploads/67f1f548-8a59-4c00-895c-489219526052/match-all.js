'use strict';
var parent = require('../../stable/instance/match-all');

module.exports = parent;
 parent;
'../string/virtual/match-all');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.matchAll;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.matchAll) ? method : own;
};
