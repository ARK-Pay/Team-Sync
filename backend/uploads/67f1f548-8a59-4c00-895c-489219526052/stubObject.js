var convert = require('./convert'),
    func = convert('stubObject', require('../stubObject'), require('./_falseOptions'));

func.placeholder = require('./placeholder');
module.exports = func;
 _.times(2, _.stubObject);
 *
 * console.log(objects);
 * // => [{}, {}]
 *
 * console.log(objects[0] === objects[1]);
 * // => false
 */
function stubObject() {
  return {};
}

module.exports = stubObject;
