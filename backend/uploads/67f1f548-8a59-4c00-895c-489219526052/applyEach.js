'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (eachfn) {
    return function applyEach(fns, ...callArgs) {
        const go = (0, _awaitify2.default)(function (callback) {
            var that = this;
            return eachfn(fns, (fn, cb) => {
                (0, _wrapAsync2.default)(fn).apply(that, callArgs.concat(cb));
            }, callback);
        });
        return go;
    };
};

var _wrapAsync = require('./wrapAsync.js');

var _wrapAsync2 = _interopRequireDefault(_wrapAsync);

var _awaitify = require('./awaitify.js');

var _awaitify2 = _interopRequireDefault(_awaitify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports.default;nc functions are passed to the final callback
 * as an array.
 *
 * @name applyEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|AsyncIterable|Object} fns - A collection of {@link AsyncFunction}s
 * to all call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {AsyncFunction} - Returns a function that takes no args other than
 * an optional callback, that is the result of applying the `args` to each
 * of the functions.
 * @example
 *
 * const appliedFn = async.applyEach([enableSearch, updateSchema], 'bucket')
 *
 * appliedFn((err, results) => {
 *     // results[0] is the results for `enableSearch`
 *     // results[1] is the results for `updateSchema`
 * });
 *
 * // partial application example:
 * async.each(
 *     buckets,
 *     async (bucket) => async.applyEach([enableSearch, updateSchema], bucket)(),
 *     callback
 * );
 */
exports.default = (0, _applyEach2.default)(_map2.default);
module.exports = exports.default;