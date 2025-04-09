'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	if (
		Array.prototype.includes
		&& Array(1).includes(undefined) // https://bugzilla.mozilla.org/show_bug.cgi?id=1767541
	) {
		return Array.prototype.includes;
	}
	return implementation;
};

	/* eslint no-invalid-this: 0 */
	if (arguments.length < 2) {
		return ownSliceBound(this, arguments.length > 0 ? start : 0);
	}
	return ownSliceBound(this, start, end);
};

module.exports = function getPolyfill() {
	return (typeof ArrayBuffer === 'function' && ArrayBuffer.prototype.slice)
		|| ownSliceWrapper
		|| implementation;
};
