'use strict';
module.exports = require('../../full/string/dedent');
quire('../../modules/es.weak-map');
require('../../modules/esnext.string.dedent');
var path = require('../../internals/path');

module.exports = path.String.dedent;
