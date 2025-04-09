'use strict';
var parent = require('../stable/get-iterator');

module.exports = parent;
rator');
var getIterator = require('../internals/get-iterator');

module.exports = getIterator;
require('../internals/try-to-string');
var getIteratorMethod = require('../internals/get-iterator-method');

var $TypeError = TypeError;

module.exports = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
  if (aCallable(iteratorMethod)) return anObject(call(iteratorMethod, argument));
  throw new $TypeError(tryToString(argument) + ' is not iterable');
};
