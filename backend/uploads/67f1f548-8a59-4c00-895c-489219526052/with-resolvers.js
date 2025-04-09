'use strict';
var parent = require('../../stable/promise/with-resolvers');
// TODO: Remove from `core-js@4`
require('../../modules/esnext.promise.with-resolvers');

module.exports = parent;
ternals/is-callable');
var path = require('../../internals/path');

var Promise = path.Promise;
var promiseWithResolvers = Promise.withResolvers;

module.exports = function withResolvers() {
  return call(promiseWithResolvers, isCallable(this) ? this : Promise);
};
