var convert = require('./convert'),
    func = convert('pull', require('../pull'));

func.placeholder = require('./placeholder');
module.exports = func;
//ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * **Note:** Unlike `_.without`, this method mutates `array`. Use `_.remove`
 * to remove elements from an array by predicate.
 *
 * @static
 * @memberOf _
 * @since 2.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {...*} [values] The values to remove.
 * @returns {Array} Returns `array`.
 * @example
 *
 * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
 *
 * _.pull(array, 'a', 'c');
 * console.log(array);
 * // => ['b', 'b']
 */
var pull = baseRest(pullAll);

module.exports = pull;
