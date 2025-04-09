'use strict';

var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-leftShift

module.exports = function BigIntLeftShift(x, y) {
	if (typeof x !== 'bigint' || typeof y !== 'bigint') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be BigInts');
	}

	// shortcut for the actual spec mechanics
	return x << y;
};
Numbers');
	}

	var lnum = ToInt32(x);
	var rnum = ToUint32(y);

	var shiftCount = rnum & 0x1F;

	return lnum << shiftCount;
};
m, 32);

	return lnum << shiftCount;
};
