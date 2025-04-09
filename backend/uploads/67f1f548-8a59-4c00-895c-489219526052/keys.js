'use strict';
var parent = require('../../../stable/array/virtual/keys');

module.exports = parent;
string');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'keys');
ototypeOf(ArrayPrototype, it) && own === ArrayPrototype.keys) ? method : own;
};
ables = {
  DOMTokenList: true,
  NodeList: true
};

module.exports = function (it) {
  var own = it.keys;
  return it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.keys)
    || hasOwn(DOMIterables, classof(it)) ? method : own;
};
