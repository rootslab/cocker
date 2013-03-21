var log = console.log,
    assert = require( 'assert' ),
    net = require( 'net' ),
    Cocker = require('../'),
    opt = {
        debug : !!true,
        // host : 'localhost',
        port : 1,
        attempts : 3
    },
    ck = Cocker( opt ),
    server = null,
    secs = 2,
    // some listeners
    onOffline = function () {
    },
    onOnline = function () {
    },
    onAttempt = function ( k, timestamp ) {
    },
    onLost = function () {
        setTimeout( function () {
            ck.run();
        }, secs * 2000 );
    };

log( '- test Cocker reconnection-loop with %s attempts.', opt.attempts );
log( '- ok, test server is not running:' );

ck.on( 'online', onOnline );
ck.on( 'offline', onOffline );
ck.on( 'attempt', onAttempt );
ck.once( 'lost', onLost );

ck.run();