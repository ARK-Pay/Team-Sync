'use strict';

var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-lessThan

module.exports = function BigIntLessThan(x, y) {
	if (typeof x !== 'bigint' || typeof y !== 'bigint') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be BigInts');
	}

	// shortcut for the actual spec mechanics
	return x < y;
};
 return undefined.
	// If y is NaN, return undefined.
	if (isNaN(x) || isNaN(y)) {
		return void undefined;
	}

	// shortcut for the actual spec mechanics
	return x < y;
};
