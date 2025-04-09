'use strict';

var $TypeError = require('es-errors/type');

var Invoke = require('./Invoke');

var isObject = require('../helpers/isObject');

// https://262.ecma-international.org/6.0/#sec-iteratornext

module.exports = function IteratorNext(iterator, value) {
	var result = Invoke(iterator, 'next', arguments.length < 2 ? [] : [value]);
	if (!isObject(result)) {
		throw new $TypeError('iterator next must return an object');
	}
	return result;
};
tor Record'); // step 1
	}

	var result;
	if (arguments.length < 2) { // step 1
		result = Call(iteratorRecord['[[NextMethod]]'], iteratorRecord['[[Iterator]]']); // step 1.a
	} else { // step 2
		result = Call(iteratorRecord['[[NextMethod]]'], iteratorRecord['[[Iterator]]'], [arguments[1]]); // step 2.a
	}

	if (!isObject(result)) {
		throw new $TypeError('iterator next must return an object'); // step 3
	}
	return result; // step 4
};
