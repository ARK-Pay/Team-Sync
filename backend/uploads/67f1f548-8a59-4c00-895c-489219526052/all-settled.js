'use strict';
var parent = require('../../stable/promise/all-settled');

module.exports = parent;
ng');
require('../../modules/es.promise');
require('../../modules/es.promise.all-settled');
require('../../modules/es.string.iterator');
var call = require('../../internals/function-call');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Promise = path.Promise;
var $allSettled = Promise.allSettled;

module.exports = function allSettled(iterable) {
  return call($allSettled, isCallable(this) ? this : Promise, iterable);
};
