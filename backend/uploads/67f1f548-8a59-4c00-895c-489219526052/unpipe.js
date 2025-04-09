'use strict'

const stream = require('stream')
const check = require('check-types')
const parse = require('./parse')

module.exports = unpipe

/**
 * Public function `unpipe`.
 *
 * Returns a writeable stream that can be passed to stream.pipe, then parses JSON
 * data read from the stream. If there are no errors, the callback is invoked with
 * the result as the second argument. If errors occur, the first error is passed to
 * the callback as the first argument.
 *
 * @param callback:   Function that will be called after parsing is complete.
 *
 * @option reviver:   Transformation function, invoked depth-first.
 *
 * @option discard:   The number of characters to process before discarding them
 *                    to save memory. The default value is `1048576`.
 *
 * @option yieldRate: The number of data items to process per timeslice,
 *                    default is 16384.
 **/
function unpipe (callback, options) {
  check.assert.function(callback, 'Invalid callback argument')

  const jsonstream = new stream.PassThrough()

  parse(jsonstream, { ...options, ndjson: false })
    .then(data => callback(null, data))
    .catch(error => callback(error))

  return jsonstream
}
uite('unpipe success:', () => {
      let result, error, options

      setup(done => {
        results.parse[0] = Promise.resolve('foo')
        options = { foo: 'bar', ndjson: true }
        unpipe((err, res) => {
          error = err
          result = res
          done()
        }, options)
      })

      test('parse was called once', () => {
        assert.strictEqual(log.counts.parse, 1)
      })

      test('parse was called correctly', () => {
        assert.isUndefined(log.these.parse[0])
        assert.lengthOf(log.args.parse[0], 2)
        assert.isObject(log.args.parse[0][0])
        assert.isTrue(log.args.parse[0][0].readable)
        assert.isTrue(log.args.parse[0][0].writable)
        assert.isFunction(log.args.parse[0][0].pipe)
        assert.isFunction(log.args.parse[0][0].read)
        assert.isFunction(log.args.parse[0][0]._read)
        assert.isFunction(log.args.parse[0][0].write)
        assert.isFunction(log.args.parse[0][0]._write)
        assert.notStrictEqual(log.args.parse[0][1], options)
        assert.deepEqual(log.args.parse[0][1], { foo: 'bar', ndjson: false })
      })

      test('parse result was returned', () => {
        assert.strictEqual(result, 'foo')
      })

      test('did not fail', () => {
        assert.isNull(error)
      })
    })

    suite('unpipe error:', () => {
      let result, error, options

      setup(done => {
        results.parse[0] = Promise.reject('bar')
        options = {}
        unpipe((err, res) => {
          error = err
          result = res
          done()
        }, options)
      })

      test('parse was called once', () => {
        assert.strictEqual(log.counts.parse, 1)
      })

      test('parse result was not returned', () => {
        assert.isUndefined(result)
      })

      test('failed', () => {
        assert.strictEqual(error, 'bar')
      })
    })
  })
})
