'use strict';
var parent = require('../../stable/regexp/search');

module.exports = parent;
ch');
var call = require('../../internals/function-call');
var wellKnownSymbol = require('../../internals/well-known-symbol');

var SEARCH = wellKnownSymbol('search');

module.exports = function (it, str) {
  return call(RegExp.prototype[SEARCH], it, str);
};
