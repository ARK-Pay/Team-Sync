var convert = require('./convert'),
    func = convert('stubFalse', require('../stubFalse'), require('./_falseOptions'));

func.placeholder = require('./placeholder');
module.exports = func;
[false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;
