'use strict';
var parent = require('../../stable/instance/flags');

module.exports = parent;
s = require('../regexp/flags');

var RegExpPrototype = RegExp.prototype;

module.exports = function (it) {
  return (it === RegExpPrototype || isPrototypeOf(RegExpPrototype, it)) ? flags(it) : it.flags;
};
