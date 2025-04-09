'use strict';
var parent = require('../../stable/instance/replace-all');

module.exports = parent;
 parent;
./string/virtual/replace-all');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.replaceAll;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.replaceAll) ? method : own;
};
