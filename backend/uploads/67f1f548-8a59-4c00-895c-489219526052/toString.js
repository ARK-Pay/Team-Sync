'use strict';

var GetIntrinsic = require('get-intrinsic');

var $String = GetIntrinsic('%String%');
var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/6.0/#sec-tostring

module.exports = function ToString(argument) {
	if (typeof argument === 'symbol') {
		throw new $TypeError('Cannot convert a Symbol value to a string');
	}
	return $String(argument);
};
;
};
adix) {
	if (typeof x !== 'bigint') {
		throw new $TypeError('Assertion failed: `x` must be a BigInt');
	}

	if (!isInteger(radix) || radix < 2 || radix > 36) {
		throw new $TypeError('Assertion failed: `radix` must be an integer >= 2 and <= 36');
	}

	if (!$BigIntToString) {
		throw new $SyntaxError('BigInt is not supported');
	}

	return $BigIntToString(x, radix); // steps 1 - 12
};
