'use strict';

var $isNaN = require('math-intrinsics/isNaN');

// http://262.ecma-international.org/5.1/#sec-9.12

module.exports = function SameValue(x, y) {
	if (x === y) { // 0 === -0, but they are not identical.
		if (x === 0) { return 1 / x === 1 / y; }
		return true;
	}
	return $isNaN(x) && $isNaN(y);
};
rtion failed: `x` and `y` arguments must be BigInts');
	}

	return BigIntEqual(x, y);
};
led: `x` and `y` arguments must be Numbers');
	}
	if (x === 0 && y === 0) {
		return !(isNegativeZero(x) ^ isNegativeZero(y));
	}
	return NumberSameValueZero(x, y);
};
