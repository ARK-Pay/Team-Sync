'use strict';
var parent = require('../../../stable/array/virtual/for-each');

module.exports = parent;
('../../modules/esnext.async-iterator.constructor');
require('../../modules/esnext.async-iterator.for-each');

var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('AsyncIterator', 'forEach');
ch) ? method : own;
};
= {
  DOMTokenList: true,
  NodeList: true
};

module.exports = function (it) {
  var own = it.forEach;
  return it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.forEach)
    || hasOwn(DOMIterables, classof(it)) ? method : own;
};
