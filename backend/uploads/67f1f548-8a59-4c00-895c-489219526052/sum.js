var convert = require('./convert'),
    func = convert('sum', require('../sum'), require('./_falseOptions'));

func.placeholder = require('./placeholder');
module.exports = func;
gory Math
 * @param {Array} array The array to iterate over.
 * @returns {number} Returns the sum.
 * @example
 *
 * _.sum([4, 2, 8, 6]);
 * // => 20
 */
function sum(array) {
  return (array && array.length)
    ? baseSum(array, identity)
    : 0;
}

module.exports = sum;
