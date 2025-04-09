'use strict';

var $TypeError = require('es-errors/type');

var IsInteger = require('./IsInteger');

var isNegativeZero = require('math-intrinsics/isNegativeZero');

var isTypedArray = require('is-typed-array');
var typedArrayBuffer = require('typed-array-buffer');

// https://262.ecma-international.org/11.0/#sec-isvalidintegerindex

module.exports = function IsValidIntegerIndex(O, index) {
	if (!isTypedArray) {
		throw new $TypeError('Assertion failed: `O` must be a Typed Array');
	}

	typedArrayBuffer(O); // step 1

	if (typeof index !== 'number') {
		throw new $TypeError('Assertion failed: Type(index) is not Number'); // step 2
	}

	if (!IsInteger(index)) { return false; } // step 3

	if (isNegativeZero(index)) { return false; } // step 4

	if (index < 0 || index >= O.length) { return false; } // step 5

	return true; // step 6
};
lse; } // step 5

	return true; // step 6
};
	var buffer = typedArrayBuffer(O);

	if (IsDetachedBuffer(buffer)) { return false; } // step 1

	if (!IsIntegralNumber(index)) { return false; } // step 2

	if (isNegativeZero(index)) { return false; } // step 3

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(O, 'UNORDERED'); // step 4
	if (IsTypedArrayOutOfBounds(taRecord)) {
		return false; // step 6
	}
	var length = TypedArrayLength(taRecord); // step 7

	if (index < 0 || index >= length) { return false; } // step 8

	return true; // step 9
};
