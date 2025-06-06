'use strict';

var isInteger = require('math-intrinsics/isInteger');

// https://262.ecma-international.org/12.0/#sec-isinteger

module.exports = function IsIntegralNumber(argument) {
	return isInteger(argument);
};
(argument) {
	if (typeof argument !== 'number' || !$isFinite(argument)) {
		return false;
	}
	return truncate(argument) === argument;
};
