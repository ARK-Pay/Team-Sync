var table = require('../');
var t = table([
    [ 'beep', '1024' ],
    [ 'boop', '33450' ],
    [ 'foo', '1006' ],
    [ 'bar', '45' ]
], { align: [ 'l', 'r' ] });
console.log(t);
     [ 'foo', '1006' ],
        [ 'bar', '45' ]
    ], { align: [ 'l', 'r' ] });
    t.equal(s, [
        'beep   1024',
        'boop  33450',
        'foo    1006',
        'bar      45'
    ].join('\n'));
});
