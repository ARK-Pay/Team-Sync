var convert = require('./convert'),
    func = convert('stubArray', require('../stubArray'), require('./_falseOptions'));

func.placeholder = require('./placeholder');
module.exports = func;
.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;
