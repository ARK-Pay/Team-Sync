'use strict';

var $TypeError = require('es-errors/type');

var isPropertyDescriptor = require('../helpers/records/property-descriptor');
var fromPropertyDescriptor = require('../helpers/fromPropertyDescriptor');

// https://262.ecma-international.org/6.0/#sec-frompropertydescriptor

module.exports = function FromPropertyDescriptor(Desc) {
	if (typeof Desc !== 'undefined' && !isPropertyDescriptor(Desc)) {
		throw new $TypeError('Assertion failed: `Desc` must be a Property Descriptor');
	}

	return fromPropertyDescriptor(Desc);
};
r');
	}

	if (IsDataDescriptor(Desc)) {
		return {
			value: Desc['[[Value]]'],
			writable: !!Desc['[[Writable]]'],
			enumerable: !!Desc['[[Enumerable]]'],
			configurable: !!Desc['[[Configurable]]']
		};
	} else if (IsAccessorDescriptor(Desc)) {
		return {
			get: Desc['[[Get]]'],
			set: Desc['[[Set]]'],
			enumerable: !!Desc['[[Enumerable]]'],
			configurable: !!Desc['[[Configurable]]']
		};
	}
	throw new $TypeError('FromPropertyDescriptor must be called with a fully populated Property Descriptor');

};
