'use strict';

var $isNaN = require('math-intrinsics/isNaN');

// https://262.ecma-international.org/6.0/#sec-samevaluezero

module.exports = function SameValueZero(x, y) {
	return (x === y) || ($isNaN(x) && $isNaN(y));
};
eZero(x, y) {
	if (typeof x !== 'bigint' || typeof y !== 'bigint') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be BigInts');
	}

	return BigIntEqual(x, y);
};
ar yNaN = isNaN(y);
	if (xNaN || yNaN) {
		return xNaN === yNaN;
	}
	return x === y;
};
