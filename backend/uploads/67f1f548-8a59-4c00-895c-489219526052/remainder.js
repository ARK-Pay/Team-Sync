'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $RangeError = require('es-errors/range');
var $TypeError = require('es-errors/type');

var zero = $BigInt && $BigInt(0);

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-remainder

module.exports = function BigIntRemainder(n, d) {
	if (typeof n !== 'bigint' || typeof d !== 'bigint') {
		throw new $TypeError('Assertion failed: `n` and `d` arguments must be BigInts');
	}

	if (d === zero) {
		throw new $RangeError('Division by zero');
	}

	if (n === zero) {
		return zero;
	}

	// shortcut for the actual spec mechanics
	return n % d;
};
e dividend.
	// If the dividend is a zero and the divisor is nonzero and finite, the result is the same as the dividend.
	if (!isFinite(d) || (n === 0 && d !== 0)) {
		return n;
	}

	// In the remaining cases, where neither an infinity, nor a zero, nor NaN is involved…
	return n % d;
};
te(d) || n === 0 || d === 0) {
		throw new $TypeError('Assertion failed: `n` and `d` arguments must be finite and nonzero');
	}
	var quotient = n / d;
	var q = truncate(quotient);
	var r = n - (d * q);
	if (r === 0 && n < 0) {
		return -0;
	}
	return r;
};
