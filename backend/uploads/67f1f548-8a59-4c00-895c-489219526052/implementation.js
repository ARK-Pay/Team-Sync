module.exports = require('./register')().implementation
tation');
var callBind = require('call-bind');
var test = require('tape');
var hasStrictMode = require('has-strict-mode')();
var runTests = require('./tests');

test('as a function', function (t) {
	t.test('bad array/this value', { skip: !hasStrictMode }, function (st) {
		/* eslint no-useless-call: 0 */
		st['throws'](function () { implementation.call(undefined); }, TypeError, 'undefined is not an object');
		st['throws'](function () { implementation.call(null); }, TypeError, 'null is not an object');
		st.end();
	});

	runTests(callBind(implementation), t);

	t.end();
});
thout breaking IE 8
var $max = GetIntrinsic('%Math.max%');

module.exports = function includes(searchElement) {
	var fromIndex = arguments.length > 1 ? ToIntegerOrInfinity(arguments[1]) : 0;
	if ($indexOf && !$isNaN(searchElement) && $isFinite(fromIndex) && typeof searchElement !== 'undefined') {
		return $indexOf.apply(this, arguments) > -1;
	}

	var O = ToObject(this);
	var length = ToLength(O.length);
	if (length === 0) {
		return false;
	}
	var k = fromIndex >= 0 ? fromIndex : $max(0, length + fromIndex);
	while (k < length) {
		if (SameValueZero(searchElement, isString(O) ? $charAt(O, k) : O[k])) {
			return true;
		}
		k += 1;
	}
	return false;
};
= 0;

	var accumulator;
	var Pk, kPresent;
	if (arguments.length > 1) {
		accumulator = arguments[1];
	} else {
		kPresent = false;
		while (!kPresent && k < len) {
			Pk = ToString(k);
			kPresent = HasProperty(O, Pk);
			if (kPresent) {
				accumulator = Get(O, Pk);
			}
			k += 1;
		}
		if (!kPresent) {
			throw new $TypeError('reduce of empty array with no initial value');
		}
	}

	while (k < len) {
		Pk = ToString(k);
		kPresent = HasProperty(O, Pk);
		if (kPresent) {
			var kValue = Get(O, Pk);
			accumulator = Call(callbackfn, void undefined, [accumulator, kValue, k, O]);
		}
		k += 1;
	}

	return accumulator;
};
}

	if (new$ === O) {
		throw new $TypeError('new ArrayBuffer should not have been the same as the receiver'); // step 20
	}

	if (arrayBufferByteLength(new$) < newLen) {
		throw new $TypeError('new ArrayBuffer\'s byteLength must be at least the requested length'); // step 21
	}

	if (IsDetachedBuffer(O)) {
		throw new $TypeError('receiver became an detached ArrayBuffer'); // step 23
	}

	/*
	24. Let fromBuf be O.[[ArrayBufferData]].
	25. Let toBuf be new.[[ArrayBufferData]].
	26. Perform CopyDataBlockBytes(toBuf, 0, fromBuf, first, newLen).
	*/
	var sourceArr = new $Uint8Array(O);
	var destArr = new $Uint8Array(new$);
	for (var i = start, ii = 0; i < end; i++, ii++) {
		destArr[ii] = sourceArr[i];
	}

	return new$; // step 27
};
