'use strict';
module.exports = require('../../full/instance/code-points');
oints');

var method = require('../string/virtual/code-points');

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.codePoints;
  return typeof it == 'string' || it === StringPrototype
    || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.codePoints) ? method : own;
};
