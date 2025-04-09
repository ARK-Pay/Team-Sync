'use strict';

var ToUint16 = require('./ToUint16');

// https://262.ecma-international.org/6.0/#sec-toint16

module.exports = function ToInt16(argument) {
	var int16bit = ToUint16(argument);
	return int16bit >= 0x8000 ? int16bit - 0x10000 : int16bit;
};
; // Math.pow(2, 16);

module.exports = function ToInt16(argument) {
	var number = ToNumber(argument);
	if (!isFinite(number) || number === 0) {
		return 0;
	}
	var int = truncate(number);
	var int16bit = modulo(int, two16);
	return int16bit >= 0x8000 ? int16bit - two16 : int16bit;
};
