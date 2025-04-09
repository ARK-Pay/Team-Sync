'use strict';
var parent = require('../../stable/symbol/async-iterator');

module.exports = parent;
require('../../internals/well-known-symbol-wrapped');

module.exports = WrappedWellKnownSymbolModule.f('asyncIterator');
