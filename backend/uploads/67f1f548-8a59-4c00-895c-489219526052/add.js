'use strict';

var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-add

module.exports = function BigIntAdd(x, y) {
	if (typeof x !== 'bigint' || typeof y !== 'bigint') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be BigInts');
	}

	// shortcut for the actual spec mechanics
	return x + y;
};
 isNaN(y) || (x === Infinity && y === -Infinity) || (x === -Infinity && y === Infinity)) {
		return NaN;
	}

	if ((x === Infinity && y === Infinity) || (x === -Infinity && y === -Infinity)) {
		return x;
	}

	if (x === Infinity) {
		return x;
	}

	if (y === Infinity) {
		return y;
	}

	if (x === y && x === 0) {
		return Infinity / x === -Infinity && Infinity / y === -Infinity ? -0 : +0;
	}

	if (x === -y || -x === y) {
		return +0;
	}

	// shortcut for the actual spec mechanics
	return x + y;
};
