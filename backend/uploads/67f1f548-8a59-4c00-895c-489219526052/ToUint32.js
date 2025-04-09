'use strict';

var ToNumber = require('./ToNumber');

// http://262.ecma-international.org/5.1/#sec-9.6

module.exports = function ToUint32(x) {
	return ToNumber(x) >>> 0;
};
);

// https://262.ecma-international.org/14.0/#sec-touint32

var two32 = 0x100000000; // Math.pow(2, 32);

module.exports = function ToUint32(argument) {
	var number = ToNumber(argument);
	if (!isFinite(number) || number === 0) {
		return 0;
	}
	var int = truncate(number);
	var int32bit = modulo(int, two32);
	return int32bit === 0 ? 0 : int32bit; // in the spec, these are math values, so we filter out -0 here
};
