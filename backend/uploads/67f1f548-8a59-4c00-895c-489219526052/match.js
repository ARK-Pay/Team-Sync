'use strict'

const check = require('check-types')
const DataStream = require('./datastream')
const events = require('./events')
const Hoopy = require('hoopy')
const jsonpath = require('jsonpath')
const walk = require('./walk')

const DEFAULT_BUFFER_LENGTH = 1024

module.exports = match

/**
 * Public function `match`.
 *
 * Asynchronously parses a stream of JSON data, returning a stream of items
 * that match the argument. Note that if a value is `null`, it won't be matched
 * because `null` is used to signify end-of-stream in node.
 *
 * @param stream:         Readable instance representing the incoming JSON.
 *
 * @param selector:       Regular expression, string or predicate function used to
 *                        identify matches. If a regular expression or string is
 *                        passed, only property keys are tested. If a predicate is
 *                        passed, both the key and the value are passed to it as
 *                        arguments.
 *
 * @option minDepth:      Number indicating the minimum depth to apply the selector
 *                        to. The default is `0`, but setting it to a higher value
 *                        can improve performance and reduce memory usage by
 *                        eliminating the need to actualise top-level items.
 *
 * @option numbers:       Boolean, indicating whether numerical keys (e.g. array
 *                        indices) should be coerced to strings before testing the
 *                        match. Only applies if the `selector` argument is a string
 *                        or regular expression.
 *
 * @option ndjson:        Set this to true to parse newline-delimited JSON,
 *                        default is `false`.
 *
 * @option yieldRate:     The number of data items to process per timeslice,
 *                        default is 16384.
 *
 * @option bufferLength:  The length of the match buffer, default is 1024.
 *
 * @option highWaterMark: If set, will be passed to the readable stream constructor
 *                        as the value for the highWaterMark option.
 *
 * @option Promise:       The promise constructor to use, defaults to bluebird.
 **/
function match (stream, selector, options = {}) {
  const keys = []
  const scopes = []
  const properties = []
  const emitter = walk(stream, options)
  const matches = new Hoopy(options.bufferLength || DEFAULT_BUFFER_LENGTH)
  let streamOptions
  const { highWaterMark } = options
  if (highWaterMark) {
    streamOptions = { highWaterMark }
  }
  const results = new DataStream(read, streamOptions)

  let selectorFunction, selectorPath, selectorString, resume
  let coerceNumbers = false
  let awaitPush = true
  let isEnded = false
  let length = 0
  let index = 0

  const minDepth = options.minDepth || 0
  check.assert.greaterOrEqual(minDepth, 0)

  if (check.function(selector)) {
    selectorFunction = selector
    selector = null
  } else if (check.string(selector)) {
    check.assert.nonEmptyString(selector)

    if (selector.startsWith('$.')) {
      selectorPath = jsonpath.parse(selector)
      check.assert.identical(selectorPath.shift(), {
        expression: {
          type: 'root',
          value: '$',
        },
      })
      selectorPath.forEach((part) => {
        check.assert.equal(part.scope, 'child')
      })
    } else {
      selectorString = selector
      coerceNumbers = !! options.numbers
    }

    selector = null
  } else {
    check.assert.instanceStrict(selector, RegExp)
    coerceNumbers = !! options.numbers
  }

  emitter.on(events.array, array)
  emitter.on(events.object, object)
  emitter.on(events.property, property)
  emitter.on(events.endArray, endScope)
  emitter.on(events.endObject, endScope)
  emitter.on(events.string, value)
  emitter.on(events.number, value)
  emitter.on(events.literal, value)
  emitter.on(events.end, end)
  emitter.on(events.error, error)
  emitter.on(events.dataError, dataError)

  return results

  function read () {
    if (awaitPush) {
      awaitPush = false

      if (isEnded) {
        if (length > 0) {
          after()
        }

        return endResults()
      }
    }

    if (resume) {
      const resumeCopy = resume
      resume = null
      resumeCopy()
      after()
    }
  }

  function after () {
    if (awaitPush || resume) {
      return
    }

    let i

    for (i = 0; i < length && ! resume; ++i) {
      if (! results.push(matches[i + index])) {
        pause()
      }
    }

    if (i === length) {
      index = length = 0
    } else {
      length -= i
      index += i
    }
  }

  function pause () {
    resume = emitter.pause()
  }

  function endResults () {
    if (! awaitPush) {
      results.push(null)
    }
  }

  function array () {
    scopes.push([])
  }

  function object () {
    scopes.push({})
  }

  function property (name) {
    keys.push(name)

    if (scopes.length < minDepth) {
      return
    }

    properties.push(name)
  }

  function endScope () {
    if (selectorPath) {
      keys.pop()
    }
    value(scopes.pop())
  }

  function value (v) {
    let key

    if (scopes.length < minDepth) {
      return
    }

    if (scopes.length > 0) {
      const scope = scopes[scopes.length - 1]

      if (Array.isArray(scope)) {
        key = scope.length
      } else {
        key = properties.pop()
      }

      scope[key] = v
    }

    if (v === null) {
      return
    }

    if (selectorFunction) {
      if (selectorFunction(key, v, scopes.length)) {
        push(v)
      }
    } else if (selectorPath) {
      if (isSelectorPathSatisfied([ ...keys, key ])) {
        push(v)
      }
    } else {
      if (coerceNumbers && typeof key === 'number') {
        key = key.toString()
      }

      if ((selectorString && selectorString === key) || (selector && selector.test(key))) {
        push(v)
      }
    }
  }

  function isSelectorPathSatisfied (path) {
    if (selectorPath.length !== path.length) {
      return false
    }

    return selectorPath.every(({ expression, operation }, i) => {
      if (
        (operation === 'member' && expression.type === 'identifier') ||
        (operation === 'subscript' && (
          expression.type === 'string_literal' ||
          expression.type === 'numeric_literal'
        ))
      ) {
        return path[i] === expression.value
      }

      if (
        operation === 'subscript' &&
        expression.type === 'wildcard' &&
        expression.value === '*'
      ) {
        return true
      }

      return false
    })
  }

  function push (v) {
    if (length + 1 === matches.length) {
      pause()
    }

    matches[index + length++] = v

    after()
  }

  function end () {
    isEnded = true
    endResults()
  }

  function error (e) {
    results.emit('error', e)
  }

  function dataError (e) {
    results.emit('dataError', e)
  }
}
      suite('array event:', () => {
        setup(() => {
          log.args.on[0][1]()
        })

        test('results.push was not called', () => {
          assert.strictEqual(log.counts.push, 0)
        })

        suite('end event:', () => {
          setup(() => {
            log.args.on[8][1]()
          })

          test('results.push was not called', () => {
            assert.strictEqual(log.counts.push, 0)
          })

          suite('read stream:', () => {
            setup(() => {
              log.args.DataStream[0][0]()
            })

            test('results.push was called once', () => {
              assert.strictEqual(log.counts.push, 1)
            })

            test('results.push was called correctly', () => {
              assert.lengthOf(log.args.push[0], 1)
              assert.isNull(log.args.push[0][0])
            })

            test('predicate was not called', () => {
              assert.strictEqual(log.counts.predicate, 0)
            })
          })
        })

        suite('endArray and end events:', () => {
          setup(() => {
            log.args.on[3][1]()
            log.args.on[8][1]()
          })

          test('predicate was called once', () => {
            assert.strictEqual(log.counts.predicate, 1)
          })

          test('predicate was called correctly', () => {
            assert.lengthOf(log.args.predicate[0], 3)
            assert.isUndefined(log.args.predicate[0][0])
            assert.deepEqual(log.args.predicate[0][1], [])
            assert.strictEqual(log.args.predicate[0][2], 0)
          })

          test('results.push was not called', () => {
            assert.strictEqual(log.counts.push, 0)
          })

          suite('read stream:', () => {
            setup(() => {
              log.args.DataStream[0][0]()
            })

            test('results.push was called twice', () => {
              assert.strictEqual(log.counts.push, 2)
            })

            test('results.push was called correctly first time', () => {
              assert.lengthOf(log.args.push[0], 1)
              assert.deepEqual(log.args.push[0][0], [])
            })

            test('results.push was called correctly second time', () => {
              assert.lengthOf(log.args.push[1], 1)
              assert.isNull(log.args.push[1][0])
            })

            test('results.emit was not called', () => {
              assert.strictEqual(log.counts.emit, 0)
            })
          })
        })

        suite('read stream:', () => {
          setup(() => {
            log.args.DataStream[0][0]()
          })

          test('results.push was not called', () => {
            assert.strictEqual(log.counts.push, 0)
          })

          suite('end event:', () => {
            setup(() => {
              log.args.on[8][1]()
            })

            test('results.push was called once', () => {
              assert.strictEqual(log.counts.push, 1)
            })

            test('results.push was called correctly', () => {
              assert.isNull(log.args.push[0][0])
            })

            test('results.emit was not called', () => {
              assert.strictEqual(log.counts.emit, 0)
            })
          })

          suite('dataError event:', () => {
            setup(() => {
              log.args.on[10][1]('foo')
            })

            test('results.push was not called', () => {
              assert.strictEqual(log.counts.push, 0)
            })

            test('results.emit was called once', () => {
              assert.strictEqual(log.counts.emit, 1)
            })

            test('results.emit was called correctly', () => {
              assert.lengthOf(log.args.emit[0], 2)
              assert.strictEqual(log.args.emit[0][0], 'dataError')
              assert.strictEqual(log.args.emit[0][1], 'foo')
            })

            test('predicate was not called', () => {
              assert.strictEqual(log.counts.predicate, 0)
            })
          })

          suite('string event:', () => {
            setup(() => {
              log.args.on[5][1]('foo')
            })

            test('predicate was called once', () => {
              assert.strictEqual(log.counts.predicate, 1)
            })

            test('predicate was called correctly', () => {
              assert.lengthOf(log.args.predicate[0], 3)
              assert.strictEqual(log.args.predicate[0][0], 0)
              assert.strictEqual(log.args.predicate[0][1], 'foo')
              assert.strictEqual(log.args.predicate[0][2], 1)
            })

            test('results.push was called once', () => {
              assert.strictEqual(log.counts.push, 1)
            })

            test('results.push was called correctly', () => {
              assert.strictEqual(log.args.push[0][0], 'foo')
            })

            suite('string event:', () => {
              setup(() => {
                log.args.on[5][1]('bar')
              })

              test('predicate was called once', () => {
                assert.strictEqual(log.counts.predicate, 2)
              })

              test('predicate was called correctly', () => {
                assert.strictEqual(log.args.predicate[1][0], 1)
                assert.strictEqual(log.args.predicate[1][1], 'bar')
                assert.strictEqual(log.args.predicate[1][2], 1)
              })

              test('results.push was called once', () => {
                assert.strictEqual(log.counts.push, 2)
              })

              test('results.push was called correctly', () => {
                assert.strictEqual(log.args.push[1][0], 'bar')
              })
            })

            suite('array event:', () => {
              setup(() => {
                log.args.on[0][1]()
              })

              test('predicate was not called', () => {
                assert.strictEqual(log.counts.predicate, 1)
              })

              test('results.push was not called', () => {
                assert.strictEqual(log.counts.push, 1)
              })

              suite('endArray event:', () => {
                setup(() => {
                  log.args.on[3][1]()
                })

                test('predicate was called once', () => {
                  assert.strictEqual(log.counts.predicate, 2)
                })

                test('predicate was called correctly', () => {
                  assert.strictEqual(log.args.predicate[1][0], 1)
                  assert.deepEqual(log.args.predicate[1][1], [])
                  assert.strictEqual(log.args.predicate[1][2], 1)
                })

                test('results.push was called once', () => {
                  assert.strictEqual(log.counts.push, 2)
                })

                test('results.push was called correctly', () => {
                  assert.deepEqual(log.args.push[1][0], [])
                })

                suite('endArray event:', () => {
                  setup(() => {
                    log.args.on[3][1]()
                  })

                  test('predicate was called once', () => {
                    assert.strictEqual(log.counts.predicate, 3)
                  })

                  test('predicate was called correctly', () => {
                    assert.isUndefined(log.args.predicate[2][0])
                    assert.deepEqual(log.args.predicate[2][1], [ 'foo', [] ])
                    assert.strictEqual(log.args.predicate[2][2], 0)
                  })

                  test('results.push was called once', () => {
                    assert.strictEqual(log.counts.push, 3)
                  })

                  test('results.push was called correctly', () => {
                    assert.deepEqual(log.args.push[2][0], [ 'foo', [] ])
                  })

                  test('EventEmitter.pause was not called', () => {
                    assert.strictEqual(log.counts.pause, 0)
                  })
                })
              })
            })

            suite('object event:', () => {
              setup(() => {
                log.args.on[1][1]()
              })

              test('results.push was not called', () => {
                assert.strictEqual(log.counts.push, 1)
              })

              suite('property event:', () => {
                setup(() => {
                  log.args.on[2][1]('bar')
                })

                test('predicate was not called', () => {
                  assert.strictEqual(log.counts.predicate, 1)
                })

                test('results.push was not called', () => {
                  assert.strictEqual(log.counts.push, 1)
                })

                suite('string event:', () => {
                  setup(() => {
                    log.args.on[5][1]('baz')
                  })

                  test('predicate was called once', () => {
                    assert.strictEqual(log.counts.predicate, 2)
                  })

                  test('predicate was called correctly', () => {
                    assert.strictEqual(log.args.predicate[1][0], 'bar')
                    assert.strictEqual(log.args.predicate[1][1], 'baz')
                    assert.strictEqual(log.args.predicate[1][2], 2)
                  })

                  test('results.push was called once', () => {
                    assert.strictEqual(log.counts.push, 2)
                  })

                  test('results.push was called correctly', () => {
                    assert.strictEqual(log.args.push[1][0], 'baz')
                  })

                  suite('property event:', () => {
                    setup(() => {
                      log.args.on[2][1]('nested')
                    })

                    test('results.push was not called', () => {
                      assert.strictEqual(log.counts.push, 2)
                    })

                    suite('object event:', () => {
                      setup(() => {
                        log.args.on[1][1]()
                      })

                      test('predicate was not called', () => {
                        assert.strictEqual(log.counts.predicate, 2)
                      })

                      test('results.push was not called', () => {
                        assert.strictEqual(log.counts.push, 2)
                      })

                      suite('endObject event:', () => {
                        setup(() => {
                          log.args.on[4][1]()
                        })

                        test('predicate was called once', () => {
                          assert.strictEqual(log.counts.predicate, 3)
                        })

                        test('predicate was called correctly', () => {
                          assert.strictEqual(log.args.predicate[2][0], 'nested')
                          assert.deepEqual(log.args.predicate[2][1], {})
                          assert.strictEqual(log.args.predicate[2][2], 2)
                        })

                        test('results.push was called once', () => {
                          assert.strictEqual(log.counts.push, 3)
                        })

                        test('results.push was called correctly', () => {
                          assert.deepEqual(log.args.push[2][0], {})
                        })

                        suite('endObject event:', () => {
                          setup(() => {
                            log.args.on[4][1]()
                          })

                          test('predicate was called once', () => {
                            assert.strictEqual(log.counts.predicate, 4)
                          })

                          test('predicate was called correctly', () => {
                            assert.strictEqual(log.args.predicate[3][0], 1)
                            assert.deepEqual(log.args.predicate[3][1], { bar: 'baz', nested: {} })
                            assert.strictEqual(log.args.predicate[3][2], 1)
                          })

                          test('results.push was called once', () => {
                            assert.strictEqual(log.counts.push, 4)
                          })

                          test('results.push was called correctly', () => {
                            assert.deepEqual(log.args.push[3][0], { bar: 'baz', nested: {} })
                          })

                          test('EventEmitter.pause was not called', () => {
                            assert.strictEqual(log.counts.pause, 0)
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })

          suite('string events, push returns false:', () => {
            setup(() => {
              results.push[0] = false
              log.args.on[5][1]('foo')
              log.args.on[5][1]('bar')
            })

            teardown(() => {
              results.push[0] = true
            })

            test('predicate was called twice', () => {
              assert.strictEqual(log.counts.predicate, 2)
            })

            test('results.push was called once', () => {
              assert.strictEqual(log.counts.push, 1)
            })

            test('results.push was called correctly', () => {
              assert.strictEqual(log.args.push[0][0], 'foo')
            })

            test('emitter.pause was called once', () => {
              assert.strictEqual(log.counts.pause, 1)
              assert.strictEqual(log.these.pause[0], results.walk[0])
            })

            test('emitter.pause was called correctly', () => {
              assert.lengthOf(log.args.pause[0], 0)
            })

            test('resume was not called', () => {
              assert.strictEqual(log.counts.resume, 0)
            })

            suite('read stream:', () => {
              setup(() => {
                log.args.DataStream[0][0]()
              })

              test('resume was called once', () => {
                assert.strictEqual(log.counts.resume, 1)
                assert.isUndefined(log.these.resume[0])
              })

              test('resume was called correctly', () => {
                assert.lengthOf(log.args.resume[0], 0)
              })

              test('results.push was called once', () => {
                assert.strictEqual(log.counts.push, 2)
              })

              test('results.push was called correctly', () => {
                assert.strictEqual(log.args.push[1][0], 'bar')
              })
            })
          })
        })

        suite('all events then read:', () => {
          setup(() => {
            log.args.on[1][1]()
            log.args.on[2][1]('foo')
            log.args.on[5][1]('bar')
            log.args.on[4][1]()
            log.args.on[5][1]('')
            log.args.on[6][1](0)
            log.args.on[7][1](null)
            log.args.on[7][1](false)
            log.args.on[3][1]()
            log.args.on[8][1]()
            log.args.DataStream[0][0]()
          })

          test('predicate was called six times', () => {
            assert.strictEqual(log.counts.predicate, 6)
          })

          test('predicate was called correctly first time', () => {
            assert.strictEqual(log.args.predicate[0][0], 'foo')
            assert.strictEqual(log.args.predicate[0][1], 'bar')
            assert.strictEqual(log.args.predicate[0][2], 2)
          })

          test('predicate was called correctly second time', () => {
            assert.strictEqual(log.args.predicate[1][0], 0)
            assert.deepEqual(log.args.predicate[1][1], { foo: 'bar' })
            assert.strictEqual(log.args.predicate[1][2], 1)
          })

          test('predicate was called correctly third time', () => {
            assert.strictEqual(log.args.predicate[2][0], 1)
            assert.strictEqual(log.args.predicate[2][1], '')
            assert.strictEqual(log.args.predicate[2][2], 1)
          })

          test('predicate was called correctly fourth time', () => {
            assert.strictEqual(log.args.predicate[3][0], 2)
            assert.strictEqual(log.args.predicate[3][1], 0)
            assert.strictEqual(log.args.predicate[3][2], 1)
          })

          test('predicate was called correctly fifth time', () => {
            assert.strictEqual(log.args.predicate[4][0], 4)
            assert.strictEqual(log.args.predicate[4][1], false)
            assert.strictEqual(log.args.predicate[4][2], 1)
          })

          test('predicate was called correctly sixth time', () => {
            assert.isUndefined(log.args.predicate[5][0])
            assert.deepEqual(log.args.predicate[5][1], [ { foo: 'bar' }, '', 0, null, false ])
            assert.strictEqual(log.args.predicate[5][2], 0)
          })

          test('results.push was called seven times', () => {
            assert.strictEqual(log.counts.push, 7)
          })

          test('results.push was called correctly', () => {
            assert.strictEqual(log.args.push[0][0], 'bar')
            assert.deepEqual(log.args.push[1][0], { foo: 'bar' })
            assert.strictEqual(log.args.push[2][0], '')
            assert.strictEqual(log.args.push[3][0], 0)
            assert.strictEqual(log.args.push[4][0], false)
            assert.deepEqual(log.args.push[5][0], [ { foo: 'bar' }, '', 0, null, false ])
            assert.isNull(log.args.push[6][0])
          })

          test('results.emit was not called', () => {
            assert.strictEqual(log.counts.emit, 0)
          })
        })
      })

      suite('read then all events:', () => {
        setup(() => {
          log.args.DataStream[0][0]()
          log.args.on[0][1]()
          log.args.on[1][1]()
          log.args.on[2][1]('foo')
          log.args.on[5][1]('bar')
          log.args.on[4][1]()
          log.args.on[5][1]('')
          log.args.on[6][1](0)
          log.args.on[7][1](null)
          log.args.on[7][1](false)
          log.args.on[3][1]()
          log.args.on[8][1]()
        })

        test('results.push was called seven times', () => {
          assert.strictEqual(log.counts.push, 7)
        })

        test('results.push was called correctly', () => {
          assert.strictEqual(log.args.push[0][0], 'bar')
          assert.deepEqual(log.args.push[1][0], { foo: 'bar' })
          assert.strictEqual(log.args.push[2][0], '')
          assert.strictEqual(log.args.push[3][0], 0)
          assert.strictEqual(log.args.push[4][0], false)
          assert.deepEqual(log.args.push[5][0], [ { foo: 'bar' }, '', 0, null, false ])
          assert.isNull(log.args.push[6][0])
        })

        test('results.emit was not called', () => {
          assert.strictEqual(log.counts.emit, 0)
        })
      })
    })

    suite('match with predicate returning false:', () => {
      let stream, predicate, options, result

      setup(() => {
        predicate = spooks.fn({ name: 'predicate', log, results: [ false ] })
        result = match({}, predicate, {})
      })

      test('DataStream was called once', () => {
        assert.strictEqual(log.counts.DataStream, 1)
      })

      test('walk was called once', () => {
        assert.strictEqual(log.counts.walk, 1)
      })

      test('EventEmitter.on was called eleven times', () => {
        assert.strictEqual(log.counts.on, 11)
      })

      suite('read events:', () => {
        setup(() => {
          log.args.DataStream[0][0]()
          // [ { "foo": "bar" }, "baz", 1, true ]
          log.args.on[0][1]()
          log.args.on[1][1]()
          log.args.on[2][1]('foo')
          log.args.on[5][1]('bar')
          log.args.on[4][1]()
          log.args.on[5][1]('baz')
          log.args.on[6][1](1)
          log.args.on[7][1](true)
          log.args.on[3][1]()
          log.args.on[8][1]()
        })

        test('results.push was called once', () => {
          assert.strictEqual(log.counts.push, 1)
        })

        test('results.push was called correctly', () => {
          assert.isNull(log.args.push[0][0])
        })

        test('results.emit was not called', () => {
          assert.strictEqual(log.counts.emit, 0)
        })
      })
    })

    suite('match with string:', () => {
      let stream, options, result

      setup(() => {
        result = match({}, 'foo', {})
      })

      test('DataStream was called once', () => {
        assert.strictEqual(log.counts.DataStream, 1)
      })

      test('walk was called once', () => {
        assert.strictEqual(log.counts.walk, 1)
      })

      test('EventEmitter.on was called eleven times', () => {
        assert.strictEqual(log.counts.on, 11)
      })

      suite('read events:', () => {
        setup(() => {
          log.args.DataStream[0][0]()
          // { "foo": "bar", "baz": "qux", "foo": "wibble" }
          log.args.on[1][1]()
          log.args.on[2][1]('foo')
          log.args.on[5][1]('bar')
          log.args.on[2][1]('baz')
          log.args.on[5][1]('qux')
          log.args.on[2][1]('foo')
          log.args.on[5][1]('wibble')
          log.args.on[4][1]()
          log.args.on[8][1]()
        })

        test('results.push was called three times', () => {
          assert.strictEqual(log.counts.push, 3)
        })

        test('results.push was called correctly first time', () => {
          assert.strictEqual(log.args.push[0][0], 'bar')
        })

        test('results.push was called correctly second time', () => {
          assert.strictEqual(log.args.push[1][0], 'wibble')
        })

        test('results.push was called correctly third time', () => {
          assert.isNull(log.args.push[2][0])
        })

        test('results.emit was not called', () => {
          assert.strictEqual(log.counts.emit, 0)
        })
      })
    })

    suite('match with regular expression:', () => {
      let stream, options, result

      setup(() => {
        result = match({}, /oo/, {})
      })

      test('DataStream was called once', () => {
        assert.strictEqual(log.counts.DataStream, 1)
      })

      test('walk was called once', () => {
        assert.strictEqual(log.counts.walk, 1)
      })

      test('EventEmitter.on was called eleven times', () => {
        assert.strictEqual(log.counts.on, 11)
      })

      suite('read events:', () => {
        setup(() => {
          log.args.DataStream[0][0]()
          // { "foo": "bar", "fo": "baz", "oo": "qux" }
          log.args.on[1][1]()
          log.args.on[2][1]('foo')
          log.args.on[5][1]('bar')
          log.args.on[2][1]('fo')
          log.args.on[5][1]('baz')
          log.args.on[2][1]('oo')
          log.args.on[5][1]('qux')
          log.args.on[4][1]()
          log.args.on[8][1]()
        })

        test('results.push was called three times', () => {
          assert.strictEqual(log.counts.push, 3)
        })

        test('results.push was called correctly first time', () => {
          assert.strictEqual(log.args.push[0][0], 'bar')
        })

        test('results.push was called correctly second time', () => {
          assert.strictEqual(log.args.push[1][0], 'qux')
        })

        test('results.push was called correctly third time', () => {
          assert.isNull(log.args.push[2][0])
        })

        test('results.emit was not called', () => {
          assert.strictEqual(log.counts.emit, 0)
        })
      })
    })

    suite('match with jsonpath expression:', () => {
      let stream, options, result

      setup(() => {
        result = match({}, '$.foo.bar[*]', {})
      })

      test('DataStream was called once', () => {
        assert.strictEqual(log.counts.DataStream, 1)
      })

      test('walk was called once', () => {
        assert.strictEqual(log.counts.walk, 1)
      })

      test('EventEmitter.on was called eleven times', () => {
        assert.strictEqual(log.counts.on, 11)
      })

      suite('read events:', () => {
        setup(() => {
          log.args.DataStream[0][0]()
          // { "foo": { "bar": [ "baz", "qux" ], "wibble": "blee" } }
          log.args.on[1][1]()
          log.args.on[2][1]('foo')
          log.args.on[1][1]()
          log.args.on[2][1]('bar')
          log.args.on[0][1]()
          log.args.on[5][1]('baz')
          log.args.on[5][1]('qux')
          log.args.on[3][1]()
          log.args.on[2][1]('wibble')
          log.args.on[5][1]('blee')
          log.args.on[4][1]()
          log.args.on[8][1]()
        })

        test('results.push was called three times', () => {
          assert.strictEqual(log.counts.push, 3)
        })

        test('results.push was called correctly first time', () => {
          assert.strictEqual(log.args.push[0][0], 'baz')
        })

        test('results.push was called correctly second time', () => {
          assert.strictEqual(log.args.push[1][0], 'qux')
        })

        test('results.push was called correctly third time', () => {
          assert.isNull(log.args.push[2][0])
        })

        test('results.emit was not called', () => {
          assert.strictEqual(log.counts.emit, 0)
        })
      })
    })

    suite('match with numbers=true:', () => {
      let stream, options, result

      setup(() => {
        result = match({}, '1', { numbers: true })
      })

      test('DataStream was called once', () => {
        assert.strictEqual(log.counts.DataStream, 1)
      })

      test('walk was called once', () => {
        assert.strictEqual(log.counts.walk, 1)
      })

      test('EventEmitter.on was called eleven times', () => {
        assert.strictEqual(log.counts.on, 11)
      })

      suite('read events:', () => {
        setup(() => {
          log.args.DataStream[0][0]()
          // { "0": "foo", "1": "bar", "2": [ "baz", "qux" ] }
          log.args.on[1][1]()
          log.args.on[2][1]('0')
          log.args.on[5][1]('foo')
          log.args.on[2][1]('1')
          log.args.on[5][1]('bar')
          log.args.on[2][1]('2')
          log.args.on[0][1]()
          log.args.on[5][1]('baz')
          log.args.on[5][1]('qux')
          log.args.on[3][1]()
          log.args.on[4][1]()
          log.args.on[8][1]()
        })

        test('results.push was called three times', () => {
          assert.strictEqual(log.counts.push, 3)
        })

        test('results.push was called correctly first time', () => {
          assert.strictEqual(log.args.push[0][0], 'bar')
        })

        test('results.push was called correctly second time', () => {
          assert.strictEqual(log.args.push[1][0], 'qux')
        })

        test('results.push was called correctly third time', () => {
          assert.isNull(log.args.push[2][0])
        })

        test('results.emit was not called', () => {
          assert.strictEqual(log.counts.emit, 0)
        })
      })
    })

    suite('match with bufferLength=3:', () => {
      let stream, options, result

      setup(() => {
        result = match({}, 'foo', { bufferLength: 3 })
      })

      test('DataStream was called once', () => {
        assert.strictEqual(log.counts.DataStream, 1)
      })

      test('walk was called once', () => {
        assert.strictEqual(log.counts.walk, 1)
      })

      test('EventEmitter.on was called eleven times', () => {
        assert.strictEqual(log.counts.on, 11)
      })

      suite('two matching events:', () => {
        setup(() => {
          log.args.on[1][1]()
          log.args.on[2][1]('foo')
          log.args.on[5][1]('bar')
          log.args.on[2][1]('baz')
          log.args.on[5][1]('qux')
          log.args.on[2][1]('foo')
          log.args.on[5][1]('wibble')
          log.args.on[2][1]('foo')
        })

        test('EventEmitter.pause was not called', () => {
          assert.strictEqual(log.counts.pause, 0)
        })

        suite('matching event:', () => {
          setup(() => {
            log.args.on[5][1]('blee')
          })

          test('results.push was not called', () => {
            assert.strictEqual(log.counts.push, 0)
          })

          test('EventEmitter.pause was called once', () => {
            assert.strictEqual(log.counts.pause, 1)
          })

          test('resume was not called', () => {
            assert.strictEqual(log.counts.resume, 0)
          })

          suite('read:', () => {
            setup(() => {
              log.args.DataStream[0][0]()
            })

            test('resume was called once', () => {
              assert.strictEqual(log.counts.resume, 1)
            })

            test('results.push was called three times', () => {
              assert.strictEqual(log.counts.push, 3)
            })

            test('results.push was called correctly first time', () => {
              assert.strictEqual(log.args.push[0][0], 'bar')
            })

            test('results.push was called correctly second time', () => {
              assert.strictEqual(log.args.push[1][0], 'wibble')
            })

            test('results.push was called correctly third time', () => {
              assert.strictEqual(log.args.push[2][0], 'blee')
            })

            test('results.emit was not called', () => {
              assert.strictEqual(log.counts.emit, 0)
            })
          })
        })
      })
    })

    suite('match with minDepth=1:', () => {
      let stream, predicate, options, result

      setup(() => {
        predicate = spooks.fn({ name: 'predicate', log, results: [ true ] })
        result = match({}, predicate, { minDepth: 1 })
      })

      test('DataStream was called once', () => {
        assert.strictEqual(log.counts.DataStream, 1)
      })

      test('walk was called once', () => {
        assert.strictEqual(log.counts.walk, 1)
      })

      test('EventEmitter.on was called eleven times', () => {
        assert.strictEqual(log.counts.on, 11)
      })

      suite('read events:', () => {
        setup(() => {
          log.args.DataStream[0][0]()
          // { "foo": { "bar": { "baz": "qux" } } }
          log.args.on[1][1]()
          log.args.on[2][1]('foo')
          log.args.on[1][1]()
          log.args.on[2][1]('bar')
          log.args.on[1][1]()
          log.args.on[2][1]('baz')
          log.args.on[5][1]('qux')
          log.args.on[4][1]()
          log.args.on[4][1]()
          log.args.on[4][1]()
          log.args.on[8][1]()
        })

        test('results.push was called four times', () => {
          assert.strictEqual(log.counts.push, 4)
        })

        test('results.push was called correctly first time', () => {
          const args = log.args.push[0]
          assert.lengthOf(args, 1)
          assert.equal(args[0], 'qux')
        })

        test('results.push was called correctly second time', () => {
          const args = log.args.push[1]
          assert.lengthOf(args, 1)
          assert.deepEqual(args[0], { baz: 'qux' })
        })

        test('results.push was called correctly third time', () => {
          const args = log.args.push[2]
          assert.lengthOf(args, 1)
          assert.deepEqual(args[0], { bar: { baz: 'qux' } })
        })

        test('results.push was called correctly fourth time', () => {
          const args = log.args.push[3]
          assert.lengthOf(args, 1)
          assert.isNull(args[0])
        })

        test('results.emit was not called', () => {
          assert.strictEqual(log.counts.emit, 0)
        })
      })
    })

    suite('match with minDepth=2:', () => {
      let stream, predicate, options, result

      setup(() => {
        predicate = spooks.fn({ name: 'predicate', log, results: [ true ] })
        result = match({}, predicate, { minDepth: 2 })
      })

      test('DataStream was called once', () => {
        assert.strictEqual(log.counts.DataStream, 1)
      })

      test('walk was called once', () => {
        assert.strictEqual(log.counts.walk, 1)
      })

      test('EventEmitter.on was called eleven times', () => {
        assert.strictEqual(log.counts.on, 11)
      })

      suite('read events:', () => {
        setup(() => {
          log.args.DataStream[0][0]()
          // { "foo": { "bar": { "baz": "qux" } } }
          log.args.on[1][1]()
          log.args.on[2][1]('foo')
          log.args.on[1][1]()
          log.args.on[2][1]('bar')
          log.args.on[1][1]()
          log.args.on[2][1]('baz')
          log.args.on[5][1]('qux')
          log.args.on[4][1]()
          log.args.on[4][1]()
          log.args.on[4][1]()
          log.args.on[8][1]()
        })

        test('results.push was called three times', () => {
          assert.strictEqual(log.counts.push, 3)
        })

        test('results.push was called correctly first time', () => {
          const args = log.args.push[0]
          assert.lengthOf(args, 1)
          assert.equal(args[0], 'qux')
        })

        test('results.push was called correctly second time', () => {
          const args = log.args.push[1]
          assert.lengthOf(args, 1)
          assert.deepEqual(args[0], { baz: 'qux' })
        })

        test('results.push was called correctly third time', () => {
          const args = log.args.push[2]
          assert.lengthOf(args, 1)
          assert.isNull(args[0])
        })

        test('results.emit was not called', () => {
          assert.strictEqual(log.counts.emit, 0)
        })
      })
    })
  })
})
