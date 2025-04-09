'use strict';

// https://262.ecma-international.org/6.0/#sec-isarray
module.exports = require('../helpers/IsArray');
next-line global-require
var toStr = !$Array.isArray && require('call-bound')('Object.prototype.toString');

module.exports = $Array.isArray || function IsArray(argument) {
	return toStr(argument) === '[object Array]';
};
