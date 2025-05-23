# commondir

compute the closest common parent directory among an array of directories

# example

``` js
var commondir = require('commondir');
var dir = commondir(process.argv.slice(2))
console.log(dir);
```

output:

```
$ node dir.js /x/y/z /x/y /x/y/w/q
/x/y
$ node ../baz ../../foo/quux ./bizzy
/foo
```

# methods

``` js
var commondir = require('commondir');
```

## commondir(absolutePaths)

Compute the closest common parent directory for an array `absolutePaths`.

## commondir(basedir, relativePaths)

Compute the closest common parent directory for an array `relativePaths` which
will be resolved for each `dir` in `relativePaths` according to:
`path.resolve(basedir, dir)`.

# install

With [npm](https://npmjs.org) do:

```
npm install commondir
```

# license

MIT
y `xs`.

When `fn(x, i)` returns an array, its result will be concatenated with the
result array. If `fn(x, i)` returns anything else, that value will be pushed
onto the end of the result array.

install
=======

With [npm](http://npmjs.org) do:

```
npm install concat-map
```

license
=======

MIT

notes
=====

This module was written while sitting high above the ground in a tree.
