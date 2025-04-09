'use strict'

const promise = require('./promise')
const streamify = require('./streamify')

module.exports = stringify

/**
 * Public function `stringify`.
 *
 * Returns a promise and asynchronously serialises a data structure to a
 * JSON string. Sanely handles promises, buffers, maps and other iterables.
 *
 * @param data:          The data to transform
 *
 * @option space:        Indentation string, or the number of spaces
 *                       to indent each nested level by.
 *
 * @option promises:     'resolve' or 'ignore', default is 'resolve'.
 *
 * @option buffers:      'toString' or 'ignore', default is 'toString'.
 *
 * @option maps:         'object' or 'ignore', default is 'object'.
 *
 * @option iterables:    'array' or 'ignore', default is 'array'.
 *
 * @option circular:     'error' or 'ignore', default is 'error'.
 *
 * @option yieldRate:     The number of data items to process per timeslice,
 *                        default is 16384.
 *
 * @option bufferLength:  The length of the buffer, default is 1024.
 *
 * @option highWaterMark: If set, will be passed to the readable stream constructor
 *                        as the value for the highWaterMark option.
 *
 * @option Promise:       The promise constructor to use, defaults to bluebird.
 **/
function stringify (data, options) {
  const json = []
  const Promise = promise(options)
  const stream = streamify(data, options)

  let resolve, reject

  stream.on('data', read)
  stream.on('end', end)
  stream.on('error', error)
  stream.on('dataError', error)

  return new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  function read (chunk) {
    json.push(chunk)
  }

  function end () {
    resolve(json.join(''))
  }

  function error (e) {
    reject(e)
  }
}

      test('streamify was called correctly', () => {
        assert.lengthOf(log.args.streamify[0], 2)
        assert.strictEqual(log.args.streamify[0][0], data)
        assert.lengthOf(Object.keys(log.args.streamify[0][0]), 0)
        assert.strictEqual(log.args.streamify[0][1], options)
        assert.lengthOf(Object.keys(log.args.streamify[0][1]), 0)
      })

      test('stream.on was called four times', () => {
        assert.strictEqual(log.counts.on, 4)
      })

      test('stream.on was called correctly first time', () => {
        assert.lengthOf(log.args.on[0], 2)
        assert.strictEqual(log.args.on[0][0], 'data')
        assert.isFunction(log.args.on[0][1])
      })

      test('stream.on was called correctly second time', () => {
        assert.strictEqual(log.args.on[1][0], 'end')
        assert.isFunction(log.args.on[1][1])
        assert.notStrictEqual(log.args.on[1][1], log.args.on[0][1])
      })

      test('stream.on was called correctly third time', () => {
        assert.strictEqual(log.args.on[2][0], 'error')
        assert.isFunction(log.args.on[2][1])
        assert.notStrictEqual(log.args.on[2][1], log.args.on[0][1])
        assert.notStrictEqual(log.args.on[2][1], log.args.on[1][1])
      })

      test('stream.on was called correctly fourth time', () => {
        assert.strictEqual(log.args.on[3][0], 'dataError')
        assert.isFunction(log.args.on[3][1])
        assert.strictEqual(log.args.on[3][1], log.args.on[2][1])
      })

      test('promise is unfulfilled', () => {
        assert.isUndefined(resolved)
        assert.isUndefined(rejected)
      })

      suite('data event:', () => {
        setup(() => {
          log.args.on[0][1]('foo')
        })

        test('promise is unfulfilled', () => {
          assert.isUndefined(resolved)
          assert.isUndefined(rejected)
        })

        suite('end event:', () => {
          setup(d => {
            done = d
            log.args.on[1][1]()
          })

          test('promise is resolved', () => {
            assert.strictEqual(resolved, 'foo')
          })

          test('promise is not rejected', () => {
            assert.isUndefined(rejected)
          })
        })

        suite('data event:', () => {
          setup(() => {
            log.args.on[0][1]('bar')
          })

          test('promise is unfulfilled', () => {
            assert.isUndefined(resolved)
            assert.isUndefined(rejected)
          })

          suite('end event:', () => {
            setup(d => {
              done = d
              log.args.on[1][1]()
            })

            test('promise is resolved', () => {
              assert.strictEqual(resolved, 'foobar')
            })
          })

          suite('error event:', () => {
            setup(d => {
              done = d
              log.args.on[2][1]('wibble')
            })

            test('promise is rejected', () => {
              assert.strictEqual(rejected, 'wibble')
            })
          })

          suite('dataError event:', () => {
            setup(d => {
              done = d
              log.args.on[3][1]('wibble')
            })

            test('promise is rejected', () => {
              assert.strictEqual(rejected, 'wibble')
            })
          })
        })
      })
    })
  })
})
