var convert = require('./convert'),
    func = convert('tail', require('../tail'), require('./_falseOptions'));

func.placeholder = require('./placeholder');
module.exports = func;
he array to query.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * _.tail([1, 2, 3]);
 * // => [2, 3]
 */
function tail(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseSlice(array, 1, length) : [];
}

module.exports = tail;
