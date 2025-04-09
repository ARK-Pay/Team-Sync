var convert = require('./convert'),
    func = convert('stubTrue', require('../stubTrue'), require('./_falseOptions'));

func.placeholder = require('./placeholder');
module.exports = func;
true, true]
 */
function stubTrue() {
  return true;
}

module.exports = stubTrue;
