'use strict';

var IteratorComplete = require('./IteratorComplete');
var IteratorNext = require('./IteratorNext');

// https://262.ecma-international.org/6.0/#sec-iteratorstep

module.exports = function IteratorStep(iterator) {
	var result = IteratorNext(iterator);
	var done = IteratorComplete(result);
	return done === true ? false : result;
};

cord) {
	if (!isIteratorRecord(iteratorRecord)) {
		throw new $TypeError('Assertion failed: `iteratorRecord` must be an Iterator Record'); // step 1
	}

	var result = IteratorNext(iteratorRecord); // step 1
	var done = IteratorComplete(result); // step 2
	return done === true ? false : result; // steps 3-4
};

