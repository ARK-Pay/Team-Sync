'use strict';
var parent = require('../../stable/regexp/replace');

module.exports = parent;
ce');
var call = require('../../internals/function-call');
var wellKnownSymbol = require('../../internals/well-known-symbol');

var REPLACE = wellKnownSymbol('replace');

module.exports = function (it, str, replacer) {
  return call(RegExp.prototype[REPLACE], it, str, replacer);
};
