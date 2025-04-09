'use strict';
var parent = require('../stable/get-iterator-method');

module.exports = parent;
;
var getIteratorMethod = require('../internals/get-iterator-method');

module.exports = getIteratorMethod;
ire('../internals/iterators');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR)
    || getMethod(it, '@@iterator')
    || Iterators[classof(it)];
};
