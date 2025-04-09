var convert = require('./convert'),
    func = convert('unary', require('../unary'), require('./_falseOptions'));

func.placeholder = require('./placeholder');
module.exports = func;
 Function
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 * @example
 *
 * _.map(['6', '8', '10'], _.unary(parseInt));
 * // => [6, 8, 10]
 */
function unary(func) {
  return ary(func, 1);
}

module.exports = unary;
