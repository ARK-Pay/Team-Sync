'use strict';

var ToUint8 = require('./ToUint8');

// https://262.ecma-international.org/6.0/#sec-toint8

module.exports = function ToInt8(argument) {
	var int8bit = ToUint8(argument);
	return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
};
exports = function ToInt8(argument) {
	var number = ToNumber(argument);
	if (!isFinite(number) || number === 0) {
		return 0;
	}
	var int = truncate(number);
	var int8bit = modulo(int, 0x100);
	return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
};
