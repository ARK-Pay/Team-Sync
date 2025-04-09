'use strict'

const fs = require('fs')
const parse = require('./parse')

module.exports = read

/**
 * Public function `read`.
 *
 * Returns a promise and asynchronously parses a JSON file read from disk. If
 * there are no errors, the promise is resolved with the parsed data. If errors
 * occur, the promise is rejected with the first error.
 *
 * @param path:       Path to the JSON file.
 *
 * @option reviver:   Transformation function, invoked depth-first.
 *
 * @option yieldRate: The number of data items to process per timeslice,
 *                    default is 16384.
 *
 * @option Promise:   The promise constructor to use, defaults to bluebird.
 **/
function read (path, options) {
  return parse(fs.createReadStream(path, options), { ...options, ndjson: false })
}
  },
        './parse': spooks.fn({
          name: 'parse',
          log: log,
          results: results.parse
        })
      })
    })

    test('read expects two arguments', () => {
      assert.lengthOf(read, 2)
    })

    test('read does not throw', () => {
      assert.doesNotThrow(() => {
        read()
      })
    })

    test('parse was not called', () => {
      assert.strictEqual(log.counts.parse, 0)
    })

    test('fs.createReadStream was not called', () => {
      assert.strictEqual(log.counts.createReadStream, 0)
    })

    suite('read:', () => {
      let path, options, result

      setup(() => {
        path = {}
        options = { foo: 'bar', ndjson: true }
        result = read(path, options)
      })

      test('fs.createReadStream was called once', () => {
        assert.strictEqual(log.counts.createReadStream, 1)
      })

      test('fs.createReadStream was called correctly', () => {
        assert.lengthOf(log.args.createReadStream[0], 2)
        assert.strictEqual(log.args.createReadStream[0][0], path)
        assert.lengthOf(Object.keys(log.args.createReadStream[0][0]), 0)
        assert.strictEqual(log.args.createReadStream[0][1], options)
        assert.lengthOf(Object.keys(log.args.createReadStream[0][1]), 2)
      })

      test('parse was called once', () => {
        assert.strictEqual(log.counts.parse, 1)
      })

      test('parse was called correctly', () => {
        assert.isUndefined(log.these.parse[0])
        assert.lengthOf(log.args.parse[0], 2)
        assert.strictEqual(log.args.parse[0][0], results.createReadStream[0])
        assert.lengthOf(Object.keys(log.args.parse[0][0]), 0)
        assert.notStrictEqual(log.args.parse[0][1], options)
        assert.deepEqual(log.args.parse[0][1], { foo: 'bar', ndjson: false })
      })

      test('parse result was returned', () => {
        assert.strictEqual(result, results.parse[0])
      })
    })
  })
})
