'use strict';
module.exports = require('../../../full/function/virtual/un-this');
rototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Function', 'unThis');
= it.unThis;
  return it === FunctionPrototype || (isPrototypeOf(FunctionPrototype, it) && own === FunctionPrototype.unThis) ? method : own;
};
