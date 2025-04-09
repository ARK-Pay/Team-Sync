'use strict'

const check = require('check-types')
const BfjStream = require('./stream')
const util = require('util')

util.inherits(JsonStream, BfjStream)

module.exports = JsonStream

function JsonStream (read, options) {
  if (check.not.instanceStrict(this, JsonStream)) {
    return new JsonStream(read, options)
  }

  return BfjStream.call(this, read, { ...options, encoding: 'utf8' })
}
ePath))
  })

  suite('require:', () => {
    let Stream

    setup(() => {
      Stream = require(modulePath)
    })

    test('Stream expects two arguments', () => {
      assert.lengthOf(Stream, 2)
    })

    test('calling Stream with function argument doesNotThrow', () => {
      assert.doesNotThrow(() => {
        Stream(() => {})
      })
    })

    test('calling Stream with object argument throws', () => {
      assert.throws(() => {
        Stream({ read: () => {} })
      })
    })

    test('calling Stream with new returns Stream instance', () => {
      assert.instanceOf(new Stream(() => {}), Stream)
    })

    test('calling Stream with new returns Readable instance', () => {
      assert.instanceOf(new Stream(() => {}), require('stream').Readable)
    })

    test('calling Stream without new returns Stream instance', () => {
      assert.instanceOf(Stream(() => {}), Stream)
    })

    suite('instantiate:', () => {
      let jsonstream

      setup(() => {
        jsonstream = new Stream(spooks.fn({ name: 'read', log: log }))
      })

      test('jsonstream has _read method', () => {
        assert.isFunction(jsonstream._read)
      })

      test('_read expects no arguments', () => {
        assert.lengthOf(jsonstream._read, 0)
      })

      test('read was not called', () => {
        assert.strictEqual(log.counts.read, 0)
      })

      suite('jsonstream._read:', () => {
        setup(() => {
          jsonstream._read()
        })

        test('read was called once', () => {
          assert.strictEqual(log.counts.read, 1)
          assert.isUndefined(log.these.read[0])
        })

        test('read was called correctly', () => {
          assert.lengthOf(log.args.read[0], 0)
        })
      })
    })
  })
})
