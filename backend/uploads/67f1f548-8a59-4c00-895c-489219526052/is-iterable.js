'use strict';
var parent = require('../stable/is-iterable');

module.exports = parent;
erator');
var isIterable = require('../internals/is-iterable');

module.exports = isIterable;
d');
var wellKnownSymbol = require('../internals/well-known-symbol');
var Iterators = require('../internals/iterators');

var ITERATOR = wellKnownSymbol('iterator');
var $Object = Object;

module.exports = function (it) {
  if (isNullOrUndefined(it)) return false;
  var O = $Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    || hasOwn(Iterators, classof(O));
};
