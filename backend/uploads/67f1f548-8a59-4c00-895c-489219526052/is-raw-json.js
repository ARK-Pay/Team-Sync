'use strict';
require('../../modules/esnext.json.is-raw-json');
var path = require('../../internals/path');

module.exports = path.JSON.isRawJSON;
= function isRawJSON(O) {
  if (!isObject(O)) return false;
  var state = getInternalState(O);
  return !!state && state.type === 'RawJSON';
};
