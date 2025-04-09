'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $RangeError = require('es-errors/range');
var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-exponentiate

module.exports = function BigIntExponentiate(base, exponent) {
	if (typeof base !== 'bigint' || typeof exponent !== 'bigint') {
		throw new $TypeError('Assertion failed: `base` and `exponent` arguments must be BigInts');
	}
	if (exponent < $BigInt(0)) {
		throw new $RangeError('Exponent must be positive');
	}
	if (/* base === $BigInt(0) && */ exponent === $BigInt(0)) {
		return $BigInt(1);
	}

	var square = base;
	var remaining = exponent;
	while (remaining > $BigInt(0)) {
		square += exponent;
		--remaining; // eslint-disable-line no-plusplus
	}
	return square;
};
if (isNaN(base)) {
		return NaN;
	}
	var aB = abs(base);
	if (aB > 1 && exponent === Infinity) {
		return Infinity;
	}
	if (aB > 1 && exponent === -Infinity) {
		return 0;
	}
	if (aB === 1 && (exponent === Infinity || exponent === -Infinity)) {
		return NaN;
	}
	if (aB < 1 && exponent === Infinity) {
		return +0;
	}
	if (aB < 1 && exponent === -Infinity) {
		return Infinity;
	}
	if (base === Infinity) {
		return exponent > 0 ? Infinity : 0;
	}
	if (base === -Infinity) {
		var isOdd = true;
		if (exponent > 0) {
			return isOdd ? -Infinity : Infinity;
		}
		return isOdd ? -0 : 0;
	}
	if (exponent > 0) {
		return isNegativeZero(base) ? Infinity : 0;
	}
	if (isNegativeZero(base)) {
		if (exponent > 0) {
			return isOdd ? -0 : 0;
		}
		return isOdd ? -Infinity : Infinity;
	}
	if (base < 0 && isFinite(base) && isFinite(exponent) && !IsInteger(exponent)) {
		return NaN;
	}
	*/
};
