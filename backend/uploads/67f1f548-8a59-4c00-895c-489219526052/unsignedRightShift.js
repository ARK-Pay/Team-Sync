'use strict';

var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-unsignedRightShift

module.exports = function BigIntUnsignedRightShift(x, y) {
	if (typeof x !== 'bigint' || typeof y !== 'bigint') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be BigInts');
	}

	throw new $TypeError('BigInts have no unsigned right shift, use >> instead');
};
lnum = ToInt32(x);
	var rnum = ToUint32(y);

	var shiftCount = rnum & 0x1F;

	return lnum >>> shiftCount;
};
, 32);

	return lnum >>> shiftCount;
};
