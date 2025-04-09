'use strict';
var parent = require('../../stable/promise/try');
// TODO: Remove from `core-js@4`
require('../../modules/esnext.promise.try');

module.exports = parent;
ernals/function-apply');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Promise = path.Promise;
var $try = Promise['try'];

// eslint-disable-next-line no-unused-vars -- required for arity
module.exports = ({ 'try': function (callbackfn /* , ...args */) {
  return apply($try, isCallable(this) ? this : Promise, arguments);
} })['try'];
