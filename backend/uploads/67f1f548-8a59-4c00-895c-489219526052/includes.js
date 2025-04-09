'use strict';
var parent = require('../../../stable/array/virtual/includes');

module.exports = parent;

../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'includes');
 Array.prototype;
var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.includes;
  if (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.includes)) return arrayMethod;
  if (typeof it == 'string' || it === StringPrototype || (isPrototypeOf(StringPrototype, it) && own === StringPrototype.includes)) {
    return stringMethod;
  } return own;
};
