var convert = require('./convert'),
    func = convert('upperFirst', require('../upperFirst'), require('./_falseOptions'));

func.placeholder = require('./placeholder');
module.exports = func;
string} [string=''] The string to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.upperFirst('fred');
 * // => 'Fred'
 *
 * _.upperFirst('FRED');
 * // => 'FRED'
 */
var upperFirst = createCaseFirst('toUpperCase');

module.exports = upperFirst;
