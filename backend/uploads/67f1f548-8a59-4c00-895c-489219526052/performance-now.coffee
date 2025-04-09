if performance? and performance.now
  module.exports = -> performance.now()
else if process? and process.hrtime
  module.exports = -> (getNanoSeconds() - nodeLoadTime) / 1e6
  hrtime = process.hrtime
  getNanoSeconds = ->
    hr = hrtime()
    hr[0] * 1e9 + hr[1]
  moduleLoadTime = getNanoSeconds()
  upTime = process.uptime() * 1e9
  nodeLoadTime = moduleLoadTime - upTime
else if Date.now
  module.exports = -> Date.now() - loadTime
  loadTime = Date.now()
else
  module.exports = -> new Date().getTime() - loadTime
  loadTime = new Date().getTime()
nder 1 second (averaging under 1 microsecond per call)", ->
    @timeout 1000
    now() for [0...1e6]
    undefined

  it "for 10,000 numbers, number n is never bigger than number n-1", ->
    stamps = (now() for [1...10000])
    expect(stamps).to.be.increasing

  it "shows that at least 0.2 ms has passed after a timeout of 1 ms", ->
    earlier = now()
    Bluebird.resolve().delay(1).then -> assert.isAbove (now()-earlier), 0.2

  it "shows that at most 3 ms has passed after a timeout of 1 ms", ->
    earlier = now()
    Bluebird.resolve().delay(1).then -> assert.isBelow (now()-earlier), 3

  it "shows that at least 190ms ms has passed after a timeout of 200ms", ->
    earlier = now()
    Bluebird.resolve().delay(200).then -> assert.isAbove (now()-earlier), 190

  it "shows that at most 220 ms has passed after a timeout of 200ms", ->
    earlier = now()
    Bluebird.resolve().delay(200).then -> assert.isBelow (now()-earlier), 220
