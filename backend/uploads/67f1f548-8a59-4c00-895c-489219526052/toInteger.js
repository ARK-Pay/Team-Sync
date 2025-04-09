'use strict';

var ES5ToInteger = require('../5/ToInteger');

var ToNumber = require('./ToNumber');

// https://262.ecma-international.org/6.0/#sec-tointeger

module.exports = function ToInteger(value) {
	var number = ToNumber(value);
	return ES5ToInteger(number);
};
ES5ToInteger(number);
	}
	return number === 0 ? 0 : number;
};
ec-9.4

module.exports = function ToInteger(value) {
	var number = ToNumber(value);
	if ($isNaN(number)) { return 0; }
	if (number === 0 || !$isFinite(number)) { return number; }
	return $sign(number) * floor(abs(number));
};
