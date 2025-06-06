'use strict'

const fs = require('fs')
const promise = require('./promise')
const streamify = require('./streamify')

module.exports = write

/**
 * Public function `write`.
 *
 * Returns a promise and asynchronously serialises a data structure to a
 * JSON file on disk. Sanely handles promises, buffers, maps and other
 * iterables.
 *
 * @param path:           Path to the JSON file.
 *
 * @param data:           The data to transform.
 *
 * @option space:         Indentation string, or the number of spaces
 *                        to indent each nested level by.
 *
 * @option promises:      'resolve' or 'ignore', default is 'resolve'.
 *
 * @option buffers:       'toString' or 'ignore', default is 'toString'.
 *
 * @option maps:          'object' or 'ignore', default is 'object'.
 *
 * @option iterables:     'array' or 'ignore', default is 'array'.
 *
 * @option circular:      'error' or 'ignore', default is 'error'.
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
function write (path, data, options) {
  const Promise = promise(options)

  return new Promise((resolve, reject) => {
    streamify(data, options)
      .pipe(fs.createWriteStream(path, options))
      .on('finish', () => {
        resolve()
      })
      .on('error', reject)
      .on('dataError', reject)
  })
}
     assert.strictEqual(log.counts.on, 0)
    })

    suite('write:', () => {
      let path, data, options, result

      setup(() => {
        path = {}
        data = {}
        options = {}
        result = write(path, data, options)
      })

      test('streamify was called once', () => {
        assert.strictEqual(log.counts.streamify, 1)
        assert.isUndefined(log.these.streamify[0])
      })

      test('streamify was called correctly', () => {
        assert.lengthOf(log.args.streamify[0], 2)
        assert.strictEqual(log.args.streamify[0][0], data)
        assert.lengthOf(Object.keys(log.args.streamify[0][0]), 0)
        assert.strictEqual(log.args.streamify[0][1], options)
        assert.lengthOf(Object.keys(log.args.streamify[0][1]), 0)
      })

      test('fs.createWriteStream was called once', () => {
        assert.strictEqual(log.counts.createWriteStream, 1)
      })

      test('fs.createWriteStream was called correctly', () => {
        assert.lengthOf(log.args.createWriteStream[0], 2)
        assert.strictEqual(log.args.createWriteStream[0][0], path)
        assert.lengthOf(Object.keys(log.args.createWriteStream[0][0]), 0)
        assert.strictEqual(log.args.createWriteStream[0][1], options)
        assert.lengthOf(Object.keys(log.args.createWriteStream[0][1]), 0)
      })

      test('stream.pipe was called once', () => {
        assert.strictEqual(log.counts.pipe, 1)
      })

      test('stream.pipe was called correctly', () => {
        assert.lengthOf(log.args.pipe[0], 1)
        assert.strictEqual(log.args.pipe[0][0], results.createWriteStream[0])
        assert.lengthOf(Object.keys(log.args.pipe[0][0]), 0)
      })

      test('stream.on was called three times', () => {
        assert.strictEqual(log.counts.on, 3)
      })

      test('stream.on was called correctly first time', () => {
        assert.lengthOf(log.args.on[0], 2)
        assert.strictEqual(log.args.on[0][0], 'finish')
        assert.isFunction(log.args.on[0][1])
      })

      test('stream.on was called correctly second time', () => {
        assert.lengthOf(log.args.on[1], 2)
        assert.strictEqual(log.args.on[1][0], 'error')
        assert.isFunction(log.args.on[1][1])
        assert.notStrictEqual(log.args.on[1][1], log.args.on[0][1])
      })

      test('stream.on was called correctly third time', () => {
        assert.lengthOf(log.args.on[2], 2)
        assert.strictEqual(log.args.on[2][0], 'dataError')
        assert.isFunction(log.args.on[2][1])
        assert.notStrictEqual(log.args.on[2][1], log.args.on[0][1])
        assert.strictEqual(log.args.on[2][1], log.args.on[1][1])
      })

      test('promise was returned', () => {
        assert.instanceOf(result, Promise)
      })

      suite('dispatch finish event:', () => {
        let resolved, error, passed, failed

        setup(done => {
          passed = failed = false

          result.then(res => {
            resolved = res
            passed = true
            done()
          }).catch(err => {
            error = err
            failed = true
            done()
          })
          log.args.on[0][1]('foo')
        })

        test('promise was resolved', () => {
          assert.isTrue(passed)
          assert.isFalse(failed)
          assert.isUndefined(resolved)
        })
      })

      suite('dispatch error event:', () => {
        let resolved, error, passed, failed

        setup(done => {
          passed = failed = false

          result.then(r => {
            resolved = r
            passed = true
            done()
          }).catch(e => {
            error = e
            failed = true
            done()
          })
          log.args.on[1][1]('foo')
        })

        test('promise was rejected', () => {
          assert.isTrue(failed)
          assert.isFalse(passed)
          assert.strictEqual(error, 'foo')
        })
      })

      suite('dispatch dataError event:', () => {
        let resolved, error, passed, failed

        setup(done => {
          passed = failed = false

          result.then(r => {
            resolved = r
            passed = true
            done()
          }).catch(e => {
            error = e
            failed = true
            done()
          })
          log.args.on[2][1]('wibble')
        })

        test('promise was rejected', () => {
          assert.isTrue(failed)
          assert.isFalse(passed)
          assert.strictEqual(error, 'wibble')
        })
      })
    })
  })
})

suite('write with error thrown by fs.createWriteStream:', () => {
  let write

  setup(() => {
    write = proxyquire(modulePath, {
      fs: {
        createWriteStream () {
          throw new Error('foo')
        }
      },
      './streamify': () => ({
        pipe: spooks.fn({ name: 'pipe', log: {}, chain: true }),
        on: spooks.fn({ name: 'on', log: {}, chain: true })
      })
    })
  })

  test('write does not throw', () => {
    assert.doesNotThrow(() => {
      write().catch(() => {})
    })
  })

  test('write rejects', () => {
    write()
      .then(() => assert.fail('write should reject'))
      .catch(error => {
        assert.instanceOf(error, Error)
        assert.equal(error.message, 'foo')
      })
  })
})
