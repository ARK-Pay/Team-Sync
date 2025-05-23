'use strict';

var ToNumber = require('./ToNumber');

// http://262.ecma-international.org/5.1/#sec-9.5

module.exports = function ToInt32(x) {
	return ToNumber(x) >> 0;
};
e');

// https://262.ecma-international.org/14.0/#sec-toint32

var two31 = 0x80000000; // Math.pow(2, 31);
var two32 = 0x100000000; // Math.pow(2, 32);

module.exports = function ToInt32(argument) {
	var number = ToNumber(argument);
	if (!isFinite(number) || number === 0) {
		return 0;
	}
	var int = truncate(number);
	var int32bit = modulo(int, two32);
	var result = int32bit >= two31 ? int32bit - two32 : int32bit;
	return result === 0 ? 0 : result; // in the spec, these are math values, so we filter out -0 here
};
