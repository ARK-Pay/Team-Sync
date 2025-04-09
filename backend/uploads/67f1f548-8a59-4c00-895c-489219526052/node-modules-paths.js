var path = require('path');
var parse = path.parse || require('path-parse'); // eslint-disable-line global-require

var getNodeModulesDirs = function getNodeModulesDirs(absoluteStart, modules) {
    var prefix = '/';
    if ((/^([A-Za-z]:)/).test(absoluteStart)) {
        prefix = '';
    } else if ((/^\\\\/).test(absoluteStart)) {
        prefix = '\\\\';
    }

    var paths = [absoluteStart];
    var parsed = parse(absoluteStart);
    while (parsed.dir !== paths[paths.length - 1]) {
        paths.push(parsed.dir);
        parsed = parse(parsed.dir);
    }

    return paths.reduce(function (dirs, aPath) {
        return dirs.concat(modules.map(function (moduleDir) {
            return path.resolve(prefix, aPath, moduleDir);
        }));
    }, []);
};

module.exports = function nodeModulesPaths(start, opts, request) {
    var modules = opts && opts.moduleDirectory
        ? [].concat(opts.moduleDirectory)
        : ['node_modules'];

    if (opts && typeof opts.paths === 'function') {
        return opts.paths(
            request,
            start,
            function () { return getNodeModulesDirs(start, modules); },
            opts
        );
    }

    var dirs = getNodeModulesDirs(start, modules);
    return opts && opts.paths ? dirs.concat(opts.paths) : dirs;
};
ndModuleDirs[j]] = true;
    }
    t.equal(keys(counts).length, 1, 'all found module directories had the same count');
};

test('node-modules-paths', function (t) {
    t.test('no options', function (t) {
        var start = path.join(__dirname, 'resolver');
        var dirs = nodeModulesPaths(start);

        verifyDirs(t, start, dirs);

        t.end();
    });

    t.test('empty options', function (t) {
        var start = path.join(__dirname, 'resolver');
        var dirs = nodeModulesPaths(start, {});

        verifyDirs(t, start, dirs);

        t.end();
    });

    t.test('with paths=array option', function (t) {
        var start = path.join(__dirname, 'resolver');
        var paths = ['a', 'b'];
        var dirs = nodeModulesPaths(start, { paths: paths });

        verifyDirs(t, start, dirs, null, paths);

        t.end();
    });

    t.test('with paths=function option', function (t) {
        var paths = function paths(request, absoluteStart, getNodeModulesDirs, opts) {
            return getNodeModulesDirs().concat(path.join(absoluteStart, 'not node modules', request));
        };

        var start = path.join(__dirname, 'resolver');
        var dirs = nodeModulesPaths(start, { paths: paths }, 'pkg');

        verifyDirs(t, start, dirs, null, [path.join(start, 'not node modules', 'pkg')]);

        t.end();
    });

    t.test('with paths=function skipping node modules resolution', function (t) {
        var paths = function paths(request, absoluteStart, getNodeModulesDirs, opts) {
            return [];
        };
        var start = path.join(__dirname, 'resolver');
        var dirs = nodeModulesPaths(start, { paths: paths });
        t.deepEqual(dirs, [], 'no node_modules was computed');
        t.end();
    });

    t.test('with moduleDirectory option', function (t) {
        var start = path.join(__dirname, 'resolver');
        var moduleDirectory = 'not node modules';
        var dirs = nodeModulesPaths(start, { moduleDirectory: moduleDirectory });

        verifyDirs(t, start, dirs, moduleDirectory);

        t.end();
    });

    t.test('with 1 moduleDirectory and paths options', function (t) {
        var start = path.join(__dirname, 'resolver');
        var paths = ['a', 'b'];
        var moduleDirectory = 'not node modules';
        var dirs = nodeModulesPaths(start, { paths: paths, moduleDirectory: moduleDirectory });

        verifyDirs(t, start, dirs, moduleDirectory, paths);

        t.end();
    });

    t.test('with 1+ moduleDirectory and paths options', function (t) {
        var start = path.join(__dirname, 'resolver');
        var paths = ['a', 'b'];
        var moduleDirectories = ['not node modules', 'other modules'];
        var dirs = nodeModulesPaths(start, { paths: paths, moduleDirectory: moduleDirectories });

        verifyDirs(t, start, dirs, moduleDirectories, paths);

        t.end();
    });

    t.test('combine paths correctly on Windows', function (t) {
        var start = 'C:\\Users\\username\\myProject\\src';
        var paths = [];
        var moduleDirectories = ['node_modules', start];
        var dirs = nodeModulesPaths(start, { paths: paths, moduleDirectory: moduleDirectories });

        t.equal(dirs.indexOf(path.resolve(start)) > -1, true, 'should contain start dir');

        t.end();
    });

    t.test('combine paths correctly on non-Windows', { skip: process.platform === 'win32' }, function (t) {
        var start = '/Users/username/git/myProject/src';
        var paths = [];
        var moduleDirectories = ['node_modules', '/Users/username/git/myProject/src'];
        var dirs = nodeModulesPaths(start, { paths: paths, moduleDirectory: moduleDirectories });

        t.equal(dirs.indexOf(path.resolve(start)) > -1, true, 'should contain start dir');

        t.end();
    });
});
