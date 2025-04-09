var convert = require('./convert'),
    func = convert('toIterator', require('../toIterator'), require('./_falseOptions'));

func.placeholder = require('./placeholder');
module.exports = func;
pped = _([1, 2]);
 *
 * wrapped[Symbol.iterator]() === wrapped;
 * // => true
 *
 * Array.from(wrapped);
 * // => [1, 2]
 */
function wrapperToIterator() {
  return this;
}

module.exports = wrapperToIterator;
