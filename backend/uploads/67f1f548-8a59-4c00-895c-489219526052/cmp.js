var equal = require('../');
console.dir([
    equal(
        { a : [ 2, 3 ], b : [ 4 ] },
        { a : [ 2, 3 ], b : [ 4 ] }
    ),
    equal(
        { x : 5, y : [6] },
        { x : 5, y : 6 }
    )
]);
not equal', function (t) {
    t.notOk(equal(
        { x : 5, y : [6] },
        { x : 5, y : 6 }
    ));
    t.end();
});

test('nested nulls', function (t) {
    t.ok(equal([ null, null, null ], [ null, null, null ]));
    t.end();
});
