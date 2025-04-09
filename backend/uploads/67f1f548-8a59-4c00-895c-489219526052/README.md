# quick-lru [![Build Status](https://travis-ci.org/sindresorhus/quick-lru.svg?branch=master)](https://travis-ci.org/sindresorhus/quick-lru) [![Coverage Status](https://coveralls.io/repos/github/sindresorhus/quick-lru/badge.svg?branch=master)](https://coveralls.io/github/sindresorhus/quick-lru?branch=master)

> Simple [“Least Recently Used” (LRU) cache](https://en.m.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_.28LRU.29)

Useful when you need to cache something and limit memory usage.

Inspired by the [`hashlru` algorithm](https://github.com/dominictarr/hashlru#algorithm), but instead uses [`Map`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map) to support keys of any type, not just strings, and values can be `undefined`.

## Install

```
$ npm install quick-lru
```

## Usage

```js
const QuickLRU = require('quick-lru');

const lru = new QuickLRU({maxSize: 1000});

lru.set('🦄', '🌈');

lru.has('🦄');
//=> true

lru.get('🦄');
//=> '🌈'
```

## API

### new QuickLRU(options?)

Returns a new instance.

### options

Type: `object`

#### maxSize

*Required*\
Type: `number`

The maximum number of items before evicting the least recently used items.

#### maxAge

Type: `number`\
Default: `Infinity`

The maximum number of milliseconds an item should remain in cache.
By default maxAge will be Infinity, which means that items will never expire.

Lazy expiration happens upon the next `write` or `read` call.

Individual expiration of an item can be specified by the `set(key, value, options)` method.

#### onEviction

*Optional*\
Type: `(key, value) => void`

Called right before an item is evicted from the cache.

Useful for side effects or for items like object URLs that need explicit cleanup (`revokeObjectURL`).

### Instance

The instance is [`iterable`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols) so you can use it directly in a [`for…of`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/for...of) loop.

Both `key` and `value` can be of any type.

#### .set(key, value, options?)

Set an item. Returns the instance.

Individual expiration of an item can be specified with the `maxAge` option. If not specified, the global `maxAge` value will be used in case it is specified on the constructor, otherwise the item will never expire.

#### .get(key)

Get an item.

#### .has(key)

Check if an item exists.

#### .peek(key)

Get an item without marking it as recently used.

#### .delete(key)

Delete an item.

Returns `true` if the item is removed or `false` if the item doesn't exist.

#### .clear()

Delete all items.

#### .resize(maxSize)

Update the `maxSize`, discarding items as necessary. Insertion order is mostly preserved, though this is not a strong guarantee.

Useful for on-the-fly tuning of cache sizes in live systems.

#### .keys()

Iterable for all the keys.

#### .values()

Iterable for all the values.

#### .entriesAscending()

Iterable for all entries, starting with the oldest (ascending in recency).

#### .entriesDescending()

Iterable for all entries, starting with the newest (descending in recency).

#### .size

The stored item count.

---

<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/npm-quick-lru?utm_source=npm-quick-lru&utm_medium=referral&utm_campaign=readme">Get professional support for this package with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>
sourcemap locations can
   be traced through it into the source files it represents.
2. `"helloworld.js"`, our original, unmodified source code. This file does not have a sourcemap, so
   we return `null`.

The `remapped` sourcemap now points from `transformed.min.js` into locations in `helloworld.js`. If
you were to read the `mappings`, it says "0th column of the first line output line points to the 1st
column of the 2nd line of the file `helloworld.js`".

### Multiple transformations of a file

As a convenience, if you have multiple single-source transformations of a file, you may pass an
array of sourcemap files in the order of most-recent transformation sourcemap first. Note that this
changes the `importer` and `depth` of each call to our loader. So our above example could have been
written as:

```js
const remapped = remapping(
  [minifiedTransformedMap, transformedMap],
  () => null
);

console.log(remapped);
// {
//   file: 'transpiled.min.js',
//   mappings: 'AAEE',
//   sources: ['helloworld.js'],
//   version: 3,
// };
```

### Advanced control of the loading graph

#### `source`

The `source` property can overridden to any value to change the location of the current load. Eg,
for an original source file, it allows us to change the location to the original source regardless
of what the sourcemap source entry says. And for transformed files, it allows us to change the
relative resolving location for child sources of the loaded sourcemap.

```js
const remapped = remapping(
  minifiedTransformedMap,
  (file, ctx) => {

    if (file === 'transformed.js') {
      // We pretend the transformed.js file actually exists in the 'src/' directory. When the nested
      // source files are loaded, they will now be relative to `src/`.
      ctx.source = 'src/transformed.js';
      return transformedMap;
    }

    console.assert(file === 'src/helloworld.js');
    // We could futher change the source of this original file, eg, to be inside a nested directory
    // itself. This will be reflected in the remapped sourcemap.
    ctx.source = 'src/nested/transformed.js';
    return null;
  }
);

console.log(remapped);
// {
//   …,
//   sources: ['src/nested/helloworld.js'],
// };
```


#### `content`

The `content` property can be overridden when we encounter an original source file. Eg, this allows
you to manually provide the source content of the original file regardless of whether the
`sourcesContent` field is present in the parent sourcemap. It can also be set to `null` to remove
the source content.

```js
const remapped = remapping(
  minifiedTransformedMap,
  (file, ctx) => {

    if (file === 'transformed.js') {
      // transformedMap does not include a `sourcesContent` field, so usually the remapped sourcemap
      // would not include any `sourcesContent` values.
      return transformedMap;
    }

    console.assert(file === 'helloworld.js');
    // We can read the file to provide the source content.
    ctx.content = fs.readFileSync(file, 'utf8');
    return null;
  }
);

console.log(remapped);
// {
//   …,
//   sourcesContent: [
//     'console.log("Hello world!")',
//   ],
// };
```

### Options

#### excludeContent

By default, `excludeContent` is `false`. Passing `{ excludeContent: true }` will exclude the
`sourcesContent` field from the returned sourcemap. This is mainly useful when you want to reduce
the size out the sourcemap.

#### decodedMappings

By default, `decodedMappings` is `false`. Passing `{ decodedMappings: true }` will leave the
`mappings` field in a [decoded state](https://github.com/rich-harris/sourcemap-codec) instead of
encoding into a VLQ string.
