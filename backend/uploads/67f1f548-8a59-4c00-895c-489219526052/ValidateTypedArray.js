'use strict';

var $TypeError = require('es-errors/type');

var IsDetachedBuffer = require('./IsDetachedBuffer');

var isObject = require('../helpers/isObject');

var isTypedArray = require('is-typed-array');
var typedArrayBuffer = require('typed-array-buffer');

// https://262.ecma-international.org/6.0/#sec-validatetypedarray

module.exports = function ValidateTypedArray(O) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: `O` must be an Object'); // step 1
	}
	if (!isTypedArray(O)) {
		throw new $TypeError('Assertion failed: `O` must be a Typed Array'); // steps 2 - 3
	}

	var buffer = typedArrayBuffer(O); // step 4

	if (IsDetachedBuffer(buffer)) {
		throw new $TypeError('`O` must be backed by a non-detached buffer'); // step 5
	}

	return buffer; // step 6
};
eps 1 - 2
	}

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(O, order); // step 3

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('`O` must be in-bounds and backed by a non-detached buffer'); // step 4
	}

	return taRecord; // step 5
};
