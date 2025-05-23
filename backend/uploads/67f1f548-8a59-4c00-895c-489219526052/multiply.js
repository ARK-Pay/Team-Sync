'use strict';

var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-multiply

module.exports = function BigIntMultiply(x, y) {
	if (typeof x !== 'bigint' || typeof y !== 'bigint') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be BigInts');
	}

	// shortcut for the actual spec mechanics
	return x * y;
};
 isNaN(y) || (x === 0 && !isFinite(y)) || (!isFinite(x) && y === 0)) {
		return NaN;
	}
	if (!isFinite(x) && !isFinite(y)) {
		return x === y ? Infinity : -Infinity;
	}
	if (!isFinite(x) && y !== 0) {
		return x > 0 ? Infinity : -Infinity;
	}
	if (!isFinite(y) && x !== 0) {
		return y > 0 ? Infinity : -Infinity;
	}

	// shortcut for the actual spec mechanics
	return x * y;
};
