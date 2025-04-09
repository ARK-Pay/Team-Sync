'use strict'

const check = require('check-types')
const EventEmitter = require('events').EventEmitter
const events = require('./events')
const promise = require('./promise')

const invalidTypes = {
  undefined: true, // eslint-disable-line no-undefined
  function: true,
  symbol: true
}

module.exports = eventify

/**
 * Public function `eventify`.
 *
 * Returns an event emitter and asynchronously traverses a data structure
 * (depth-first), emitting events as it encounters items. Sanely handles
 * promises, buffers, maps and other iterables. The event emitter is
 * decorated with a `pause` method that can be called to pause processing.
 *
 * @param data:       The data structure to traverse.
 *
 * @option promises:  'resolve' or 'ignore', default is 'resolve'.
 *
 * @option buffers:   'toString' or 'ignore', default is 'toString'.
 *
 * @option maps:      'object' or 'ignore', default is 'object'.
 *
 * @option iterables:  'array' or 'ignore', default is 'array'.
 *
 * @option circular:   'error' or 'ignore', default is 'error'.
 *
 * @option yieldRate:  The number of data items to process per timeslice,
 *                     default is 16384.
 *
 * @option Promise:      The promise constructor to use, defaults to bluebird.
 **/
function eventify (data, options = {}) {
  const coercions = {}
  const emitter = new EventEmitter()
  const Promise = promise(options)
  const references = new Map()

  let count = 0
  let disableCoercions = false
  let ignoreCircularReferences
  let ignoreItems
  let pause
  let yieldRate

  emitter.pause = () => {
    let resolve
    pause = new Promise(res => resolve = res)
    return () => {
      pause = null
      count = 0
      resolve()
    }
  }
  parseOptions()
  setImmediate(begin)

  return emitter

  function parseOptions () {
    parseCoercionOption('promises')
    parseCoercionOption('buffers')
    parseCoercionOption('maps')
    parseCoercionOption('iterables')

    if (Object.keys(coercions).length === 0) {
      disableCoercions = true
    }

    if (options.circular === 'ignore') {
      ignoreCircularReferences = true
    }

    check.assert.maybe.positive(options.yieldRate)
    yieldRate = options.yieldRate || 16384
  }

  function parseCoercionOption (key) {
    if (options[key] !== 'ignore') {
      coercions[key] = true
    }
  }

  function begin () {
    return proceed(data)
      .catch(error => emit(events.error, error))
      .then(() => emit(events.end))
  }

  function proceed (datum) {
    if (++count % yieldRate !== 0) {
      return coerce(datum).then(after)
    }

    return new Promise((resolve, reject) => {
      setImmediate(() => {
        coerce(datum)
          .then(after)
          .then(resolve)
          .catch(reject)
      })
    })

    function after (coerced) {
      if (isInvalid(coerced)) {
        return
      }

      if (coerced === false || coerced === true || coerced === null) {
        return literal(coerced)
      }

      if (Array.isArray(coerced)) {
        return array(coerced)
      }

      const type = typeof coerced

      switch (type) {
        case 'number':
          return value(coerced, type)
        case 'string':
          return value(escapeString(coerced), type)
        default:
          return object(coerced)
      }
    }
  }

  function coerce (datum) {
    if (disableCoercions || check.primitive(datum)) {
      return Promise.resolve(datum)
    }

    if (check.thenable(datum)) {
      return coerceThing(datum, 'promises', coercePromise).then(coerce)
    }

    if (check.instanceStrict(datum, Buffer)) {
      return coerceThing(datum, 'buffers', coerceBuffer)
    }

    if (check.instanceStrict(datum, Map)) {
      return coerceThing(datum, 'maps', coerceMap)
    }

    if (
      check.iterable(datum) &&
      check.not.string(datum) &&
      check.not.array(datum)
    ) {
      return coerceThing(datum, 'iterables', coerceIterable)
    }

    if (check.function(datum.toJSON)) {
      return Promise.resolve(datum.toJSON())
    }

    return Promise.resolve(datum)
  }

  function coerceThing (datum, thing, fn) {
    if (coercions[thing]) {
      return fn(datum)
    }

    return Promise.resolve()
  }

  function coercePromise (p) {
    return p
  }

  function coerceBuffer (buffer) {
    return Promise.resolve(buffer.toString())
  }

  function coerceMap (map) {
    const result = {}

    return coerceCollection(map, result, (item, key) => {
      result[key] = item
    })
  }

  function coerceCollection (coll, target, push) {
    coll.forEach(push)

    return Promise.resolve(target)
  }

  function coerceIterable (iterable) {
    const result = []

    return coerceCollection(iterable, result, item => {
      result.push(item)
    })
  }

  function isInvalid (datum) {
    const type = typeof datum
    return !! invalidTypes[type] || (
      type === 'number' && ! isValidNumber(datum)
    )
  }

  function isValidNumber (datum) {
    return datum > Number.NEGATIVE_INFINITY && datum < Number.POSITIVE_INFINITY
  }

  function literal (datum) {
    return value(datum, 'literal')
  }

  function value (datum, type) {
    return emit(events[type], datum)
  }

  function emit (event, eventData) {
    return (pause || Promise.resolve())
      .then(() => emitter.emit(event, eventData))
      .catch(err => {
        try {
          emitter.emit(events.error, err)
        } catch (_) {
          // When calling user code, anything is possible
        }
      })
  }

  function array (datum) {
    // For an array, collection:object and collection:array are the same.
    return collection(datum, datum, 'array', item => {
      if (isInvalid(item)) {
        return proceed(null)
      }

      return proceed(item)
    })
  }

  function collection (obj, arr, type, action) {
    let ignoreThisItem

    return Promise.resolve()
      .then(() => {
        if (references.has(obj)) {
          ignoreThisItem = ignoreItems = true

          if (! ignoreCircularReferences) {
            return emit(events.dataError, new Error('Circular reference.'))
          }
        } else {
          references.set(obj, true)
        }
      })
      .then(() => emit(events[type]))
      .then(() => item(0))

    function item (index) {
      if (index >= arr.length) {
        if (ignoreThisItem) {
          ignoreItems = false
        }

        if (ignoreItems) {
          return Promise.resolve()
        }

        return emit(events.endPrefix + events[type])
          .then(() => references.delete(obj))
      }

      if (ignoreItems) {
        return item(index + 1)
      }

      return action(arr[index])
        .then(() => item(index + 1))
    }
  }

  function object (datum) {
    // For an object, collection:object and collection:array are different.
    return collection(datum, Object.keys(datum), 'object', key => {
      const item = datum[key]

      if (isInvalid(item)) {
        return Promise.resolve()
      }

      return emit(events.property, escapeString(key))
        .then(() => proceed(item))
    })
  }

  function escapeString (string) {
    string = JSON.stringify(string)
    return string.substring(1, string.length - 1)
  }
}
> {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('string event did not occur', () => {
        assert.strictEqual(log.counts.string, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('function:', () => {
      setup(done => {
        const emitter = eventify(() => {})

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('string event did not occur', () => {
        assert.strictEqual(log.counts.string, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('symbol:', () => {
      setup(done => {
        const emitter = eventify(Symbol('foo'))

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('string event did not occur', () => {
        assert.strictEqual(log.counts.string, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('empty array:', () => {
      setup(done => {
        const emitter = eventify([])

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('array event occurred once', () => {
        assert.strictEqual(log.counts.array, 1)
      })

      test('array event was dispatched correctly', () => {
        assert.lengthOf(log.args.array[0], 1)
        assert.isUndefined(log.args.array[0][0])
      })

      test('endArray event occurred once', () => {
        assert.strictEqual(log.counts.endArray, 1)
      })

      test('endArray event was dispatched correctly', () => {
        assert.lengthOf(log.args.endArray[0], 1)
        assert.isUndefined(log.args.endArray[0][0])
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('string event did not occur', () => {
        assert.strictEqual(log.counts.string, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('empty object:', () => {
      setup(done => {
        const emitter = eventify({})

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('object event occurred once', () => {
        assert.strictEqual(log.counts.object, 1)
      })

      test('object event was dispatched correctly', () => {
        assert.lengthOf(log.args.object[0], 1)
        assert.isUndefined(log.args.object[0][0])
      })

      test('endObject event occurred once', () => {
        assert.strictEqual(log.counts.endObject, 1)
      })

      test('endObject event was dispatched correctly', () => {
        assert.lengthOf(log.args.endObject[0], 1)
        assert.isUndefined(log.args.endObject[0][0])
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('string event did not occur', () => {
        assert.strictEqual(log.counts.string, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('string:', () => {
      setup(done => {
        const emitter = eventify('foo')

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('string event occurred once', () => {
        assert.strictEqual(log.counts.string, 1)
      })

      test('string event was dispatched correctly', () => {
        assert.lengthOf(log.args.string[0], 1)
        assert.strictEqual(log.args.string[0][0], 'foo')
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('string with special characters:', () => {
      setup(done => {
        const emitter = eventify('foo\nbar\t"baz"')

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('string event occurred once', () => {
        assert.strictEqual(log.counts.string, 1)
      })

      test('string event was dispatched correctly', () => {
        assert.lengthOf(log.args.string[0], 1)
        assert.strictEqual(log.args.string[0][0], 'foo\\nbar\\t\\"baz\\"')
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('number:', () => {
      setup(done => {
        const emitter = eventify(42)

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('number event occurred once', () => {
        assert.strictEqual(log.counts.number, 1)
      })

      test('number event was dispatched correctly', () => {
        assert.lengthOf(log.args.number[0], 1)
        assert.strictEqual(log.args.number[0][0], 42)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('string event did not occur', () => {
        assert.strictEqual(log.counts.string, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('false:', () => {
      setup(done => {
        const emitter = eventify(false)

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('literal event occurred once', () => {
        assert.strictEqual(log.counts.literal, 1)
      })

      test('literal event was dispatched correctly', () => {
        assert.lengthOf(log.args.literal[0], 1)
        assert.isFalse(log.args.literal[0][0])
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('string event did not occur', () => {
        assert.strictEqual(log.counts.string, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('true:', () => {
      setup(done => {
        const emitter = eventify(true)

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('literal event occurred once', () => {
        assert.strictEqual(log.counts.literal, 1)
      })

      test('literal event was dispatched correctly', () => {
        assert.isTrue(log.args.literal[0][0])
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('null:', () => {
      setup(done => {
        const emitter = eventify(null)

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('literal event occurred once', () => {
        assert.strictEqual(log.counts.literal, 1)
      })

      test('literal event was dispatched correctly', () => {
        assert.isNull(log.args.literal[0][0])
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('array with items:', () => {
      setup(done => {
        const emitter = eventify([
          undefined,
          NaN,
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          'foo',
          () => {},
          'bar',
          Symbol('baz')
        ])

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('array event occurred once', () => {
        assert.strictEqual(log.counts.array, 1)
      })

      test('literal event occurred six times', () => {
        assert.strictEqual(log.counts.literal, 6)
      })

      test('literal event was dispatched correctly first time', () => {
        assert.isNull(log.args.literal[0][0])
      })

      test('literal event was dispatched correctly second time', () => {
        assert.isNull(log.args.literal[1][0])
      })

      test('literal event was dispatched correctly third time', () => {
        assert.isNull(log.args.literal[2][0])
      })

      test('literal event was dispatched correctly fourth time', () => {
        assert.isNull(log.args.literal[3][0])
      })

      test('literal event was dispatched correctly fifth time', () => {
        assert.isNull(log.args.literal[4][0])
      })

      test('literal event was dispatched correctly sixth time', () => {
        assert.isNull(log.args.literal[5][0])
      })

      test('string event occurred twice', () => {
        assert.strictEqual(log.counts.string, 2)
      })

      test('string event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.string[0][0], 'foo')
      })

      test('string event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.string[1][0], 'bar')
      })

      test('endArray event occurred once', () => {
        assert.strictEqual(log.counts.endArray, 1)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('object with properties:', () => {
      setup(done => {
        const emitter = eventify({ foo: 42,
          bar: undefined,
          baz: 3.14159265359,
          qux: Symbol('qux')
        })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('object event occurred once', () => {
        assert.strictEqual(log.counts.object, 1)
      })

      test('property event occurred twice', () => {
        assert.strictEqual(log.counts.property, 2)
      })

      test('property event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.property[0][0], 'foo')
      })

      test('property event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.property[1][0], 'baz')
      })

      test('number event occurred twice', () => {
        assert.strictEqual(log.counts.number, 2)
      })

      test('number event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.number[0][0], 42)
      })

      test('number event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.number[1][0], 3.14159265359)
      })

      test('endObject event occurred once', () => {
        assert.strictEqual(log.counts.endObject, 1)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('object with keys containing special characters:', () => {
      setup(done => {
        const emitter = eventify({ 'foo\n"bar"': 42 })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('object event occurred once', () => {
        assert.strictEqual(log.counts.object, 1)
      })

      test('property event occurred once', () => {
        assert.strictEqual(log.counts.property, 1)
      })

      test('property event was dispatched correctly', () => {
        assert.strictEqual(log.args.property[0][0], 'foo\\n\\"bar\\"')
      })

      test('number event occurred once', () => {
        assert.strictEqual(log.counts.number, 1)
      })

      test('number event was dispatched correctly', () => {
        assert.strictEqual(log.args.number[0][0], 42)
      })

      test('endObject event occurred once', () => {
        assert.strictEqual(log.counts.endObject, 1)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('nested array:', () => {
      setup(done => {
        const emitter = eventify([ 'foo', [ 'bar', [ 'baz', 'qux' ] ] ])

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('array event occurred three times', () => {
        assert.strictEqual(log.counts.array, 3)
      })

      test('string event occurred four times', () => {
        assert.strictEqual(log.counts.string, 4)
      })

      test('string event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.string[0][0], 'foo')
      })

      test('string event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.string[1][0], 'bar')
      })

      test('string event was dispatched correctly third time', () => {
        assert.strictEqual(log.args.string[2][0], 'baz')
      })

      test('string event was dispatched correctly fourth time', () => {
        assert.strictEqual(log.args.string[3][0], 'qux')
      })

      test('endArray event occurred three times', () => {
        assert.strictEqual(log.counts.endArray, 3)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('nested object:', () => {
      setup(done => {
        const emitter = eventify({ foo: { bar: { baz: 1, qux: 2 }, wibble: 3 }, wobble: 4 })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('object event occurred three times', () => {
        assert.strictEqual(log.counts.object, 3)
      })

      test('property event occurred six times', () => {
        assert.strictEqual(log.counts.property, 6)
      })

      test('property event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.property[0][0], 'foo')
      })

      test('property event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.property[1][0], 'bar')
      })

      test('property event was dispatched correctly third time', () => {
        assert.strictEqual(log.args.property[2][0], 'baz')
      })

      test('property event was dispatched correctly fourth time', () => {
        assert.strictEqual(log.args.property[3][0], 'qux')
      })

      test('property event was dispatched correctly fifth time', () => {
        assert.strictEqual(log.args.property[4][0], 'wibble')
      })

      test('property event was dispatched correctly sixth time', () => {
        assert.strictEqual(log.args.property[5][0], 'wobble')
      })

      test('number event occurred four times', () => {
        assert.strictEqual(log.counts.number, 4)
      })

      test('number event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.number[0][0], 1)
      })

      test('number event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.number[1][0], 2)
      })

      test('number event was dispatched correctly third time', () => {
        assert.strictEqual(log.args.number[2][0], 3)
      })

      test('number event was dispatched correctly fourth time', () => {
        assert.strictEqual(log.args.number[3][0], 4)
      })

      test('endObject event occurred three times', () => {
        assert.strictEqual(log.counts.endObject, 3)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('promise:', () => {
      setup(done => {
        let resolve

        const emitter = eventify(new Promise(res => resolve = res), { poll: 4 })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)

        setTimeout(resolve.bind(null, 'foo'), 20)
      })

      test('string event occurred once', () => {
        assert.strictEqual(log.counts.string, 1)
      })

      test('string event was dispatched correctly', () => {
        assert.lengthOf(log.args.string[0], 1)
        assert.strictEqual(log.args.string[0][0], 'foo')
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('ignore promise:', () => {
      setup(done => {
        let resolve

        const emitter = eventify(new Promise(res => resolve = res), { poll: 4, promises: 'ignore' })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)

        setTimeout(resolve.bind(null, 'foo'), 20)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('string event did not occur', () => {
        assert.strictEqual(log.counts.string, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('buffer:', () => {
      setup(done => {
        let resolve

        const emitter = eventify(new Buffer('foo bar baz qux'))

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('string event occurred once', () => {
        assert.strictEqual(log.counts.string, 1)
      })

      test('string event was dispatched correctly', () => {
        assert.lengthOf(log.args.string[0], 1)
        assert.strictEqual(log.args.string[0][0], 'foo bar baz qux')
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('ignore buffer:', () => {
      setup(done => {
        let resolve

        const emitter = eventify(new Buffer('foo bar baz qux'), { buffers: 'ignore' })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('string event did not occur', () => {
        assert.strictEqual(log.counts.string, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('date:', () => {
      setup(done => {
        let resolve

        const emitter = eventify(new Date('1977-06-10T10:30:00.000Z'))

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('string event occurred once', () => {
        assert.strictEqual(log.counts.string, 1)
      })

      test('string event was dispatched correctly', () => {
        assert.lengthOf(log.args.string[0], 1)
        assert.strictEqual(log.args.string[0][0], '1977-06-10T10:30:00.000Z')
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('object with toJSON method:', () => {
      setup(done => {
        let resolve

        const emitter = eventify({ toJSON () { return 'foo' } })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('string event occurred once', () => {
        assert.strictEqual(log.counts.string, 1)
      })

      test('string event was dispatched correctly', () => {
        assert.lengthOf(log.args.string[0], 1)
        assert.strictEqual(log.args.string[0][0], 'foo')
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('map:', () => {
      setup(done => {
        let resolve

        const emitter = eventify(new Map([['foo','bar'],['baz','qux']]))

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('object event occurred once', () => {
        assert.strictEqual(log.counts.object, 1)
      })

      test('property event occurred twice', () => {
        assert.strictEqual(log.counts.property, 2)
      })

      test('property event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.property[0][0], 'foo')
      })

      test('property event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.property[1][0], 'baz')
      })

      test('string event occurred twice', () => {
        assert.strictEqual(log.counts.string, 2)
      })

      test('string event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.string[0][0], 'bar')
      })

      test('string event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.string[1][0], 'qux')
      })

      test('endObject event occurred once', () => {
        assert.strictEqual(log.counts.endObject, 1)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('ignore map:', () => {
      setup(done => {
        let resolve

        const emitter = eventify(new Map([['foo','bar'],['baz','qux']]), { maps: 'ignore' })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('string event did not occur', () => {
        assert.strictEqual(log.counts.string, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('set:', () => {
      setup(done => {
        let resolve

        const emitter = eventify(new Set(['foo','bar']))

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('array event occurred once', () => {
        assert.strictEqual(log.counts.array, 1)
      })

      test('string event occurred twice', () => {
        assert.strictEqual(log.counts.string, 2)
      })

      test('string event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.string[0][0], 'foo')
      })

      test('string event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.string[1][0], 'bar')
      })

      test('endArray event occurred once', () => {
        assert.strictEqual(log.counts.endArray, 1)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('ignore set:', () => {
      setup(done => {
        let resolve

        const emitter = eventify(new Set(['foo','bar']), { iterables: 'ignore' })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('object event did not occur', () => {
        assert.strictEqual(log.counts.object, 0)
      })

      test('property event did not occur', () => {
        assert.strictEqual(log.counts.property, 0)
      })

      test('string event did not occur', () => {
        assert.strictEqual(log.counts.string, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('endObject event did not occur', () => {
        assert.strictEqual(log.counts.endObject, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('promise resolved to a map:', () => {
      setup(done => {
        let resolve

        const emitter = eventify(new Promise(res => resolve = res), { poll: 4 })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)

        setImmediate(resolve.bind(null, new Map([['foo','bar'],['baz','qux']])))
      })

      test('object event occurred once', () => {
        assert.strictEqual(log.counts.object, 1)
      })

      test('property event occurred twice', () => {
        assert.strictEqual(log.counts.property, 2)
      })

      test('property event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.property[0][0], 'foo')
      })

      test('property event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.property[1][0], 'baz')
      })

      test('string event occurred twice', () => {
        assert.strictEqual(log.counts.string, 2)
      })

      test('string event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.string[0][0], 'bar')
      })

      test('string event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.string[1][0], 'qux')
      })

      test('endObject event occurred once', () => {
        assert.strictEqual(log.counts.endObject, 1)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event did not occur', () => {
        assert.strictEqual(log.counts.array, 0)
      })

      test('number event did not occur', () => {
        assert.strictEqual(log.counts.number, 0)
      })

      test('literal event did not occur', () => {
        assert.strictEqual(log.counts.literal, 0)
      })

      test('endArray event did not occur', () => {
        assert.strictEqual(log.counts.endArray, 0)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })

      test('endPrefix event did not occur', () => {
        assert.strictEqual(log.counts.endPrefix, 0)
      })
    })

    suite('array circular reference:', () => {
      setup(done => {
        const array = [ 'foo' ]
        array[1] = array
        const emitter = eventify(array)

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('array event occurred twice', () => {
        assert.strictEqual(log.counts.array, 2)
      })

      test('string event occurred once', () => {
        assert.strictEqual(log.counts.string, 1)
      })

      test('string event was dispatched correctly', () => {
        assert.strictEqual(log.args.string[0][0], 'foo')
      })

      test('endArray event occurred twice', () => {
        assert.strictEqual(log.counts.endArray, 2)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('dataError event occurred once', () => {
        assert.strictEqual(log.counts.dataError, 1)
      })

      test('dataError event was dispatched correctly', () => {
        assert.lengthOf(log.args.dataError[0], 1)
        assert.instanceOf(log.args.dataError[0][0], Error)
        assert.strictEqual(log.args.dataError[0][0].message, 'Circular reference.')
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })
    })

    suite('object circular reference:', () => {
      setup(done => {
        const object = { foo: 'bar' }
        object.self = object
        const emitter = eventify(object)

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('object event occurred twice', () => {
        assert.strictEqual(log.counts.object, 2)
      })

      test('property event occurred twice', () => {
        assert.strictEqual(log.counts.property, 2)
      })

      test('property event was dispatched correctly first time', () => {
        assert.strictEqual(log.args.property[0][0], 'foo')
      })

      test('property event was dispatched correctly second time', () => {
        assert.strictEqual(log.args.property[1][0], 'self')
      })

      test('endObject event occurred twice', () => {
        assert.strictEqual(log.counts.endObject, 2)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('dataError event occurred once', () => {
        assert.strictEqual(log.counts.dataError, 1)
      })

      test('dataError event was dispatched correctly', () => {
        assert.strictEqual(log.args.dataError[0][0].message, 'Circular reference.')
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })
    })

    suite('array circular reference with ignore set:', () => {
      setup(done => {
        const array = [ 'foo' ]
        array[1] = array
        const emitter = eventify(array, { circular: 'ignore' })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('array event occurred twice', () => {
        assert.strictEqual(log.counts.array, 2)
      })

      test('string event occurred once', () => {
        assert.strictEqual(log.counts.string, 1)
      })

      test('endArray event occurred twice', () => {
        assert.strictEqual(log.counts.endArray, 2)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('object circular reference with ignore set:', () => {
      setup(done => {
        const object = { foo: 'bar' }
        object.self = object
        const emitter = eventify(object, { circular: 'ignore' })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('object event occurred twice', () => {
        assert.strictEqual(log.counts.object, 2)
      })

      test('property event occurred twice', () => {
        assert.strictEqual(log.counts.property, 2)
      })

      test('endObject event occurred twice', () => {
        assert.strictEqual(log.counts.endObject, 2)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('parallel array reference:', () => {
      setup(done => {
        const array = [ 'foo' ]
        const emitter = eventify([ array, array ])

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('array event occurred three times', () => {
        assert.strictEqual(log.counts.array, 3)
      })

      test('string event occurred twice', () => {
        assert.strictEqual(log.counts.string, 2)
      })

      test('endArray event occurred three times', () => {
        assert.strictEqual(log.counts.endArray, 3)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('parallel object reference:', () => {
      setup(done => {
        const object = { foo: 'bar' }
        const emitter = eventify({ baz: object, qux: object })

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
        })

        emitter.on(events.end, done)
      })

      test('object event occurred three times', () => {
        assert.strictEqual(log.counts.object, 3)
      })

      test('property event occurred four times', () => {
        assert.strictEqual(log.counts.property, 4)
      })

      test('endObject event occurred three times', () => {
        assert.strictEqual(log.counts.endObject, 3)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('error event did not occur', () => {
        assert.strictEqual(log.counts.error, 0)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })

    suite('throw errors from event handlers:', () => {
      setup(done => {
        const emitter = eventify([null,false,true,0,"",{"foo":"bar"}])

        Object.entries(events).forEach(([ key, value ]) => {
          emitter.on(value, spooks.fn({
            name: key,
            log: log
          }))
          if (value !== events.end) {
            emitter.on(value, () => { throw 0 })
          }
        })

        emitter.on(events.end, done)
      })

      test('end event occurred once', () => {
        assert.strictEqual(log.counts.end, 1)
      })

      test('array event occured once', () => {
        assert.strictEqual(log.counts.array, 1)
      })

      test('literal event occured three times', () => {
        assert.strictEqual(log.counts.literal, 3)
      })

      test('number event occured once', () => {
        assert.strictEqual(log.counts.number, 1)
      })

      test('string event occured twice', () => {
        assert.strictEqual(log.counts.string, 2)
      })

      test('object event occured once', () => {
        assert.strictEqual(log.counts.object, 1)
      })

      test('property event occured once', () => {
        assert.strictEqual(log.counts.property, 1)
      })

      test('endObject event occured once', () => {
        assert.strictEqual(log.counts.endObject, 1)
      })

      test('endArray event occured once', () => {
        assert.strictEqual(log.counts.endArray, 1)
      })

      test('error event occured eleven times', () => {
        assert.strictEqual(log.counts.error, 11)
      })

      test('dataError event did not occur', () => {
        assert.strictEqual(log.counts.dataError, 0)
      })
    })
  })
})
