var convert = require('./convert'),
    func = convert('wrapperValue', require('../wrapperValue'), require('./_falseOptions'));

func.placeholder = require('./placeholder');
module.exports = func;

 * @category Seq
 * @returns {*} Returns the resolved unwrapped value.
 * @example
 *
 * _([1, 2, 3]).value();
 * // => [1, 2, 3]
 */
function wrapperValue() {
  return baseWrapperValue(this.__wrapped__, this.__actions__);
}

module.exports = wrapperValue;
