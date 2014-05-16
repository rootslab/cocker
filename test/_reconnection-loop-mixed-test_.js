var log = console.log,
    assert = require( 'assert' ),
    net = require( 'net' ),
    Cocker = require('../'),
    opt = {
        debug : !!true,
        // host : 'localhost',
        port : 50000,
        attempts : 3
    },
    ck = Cocker( opt ),
    server = null,
    secs = 2,
    stop = false,
    // some listeners
    onOffline = function () {

    },
    onOnline = function () {
        ck.bye();
        setTimeout( function () {
            server.close();
        }, secs * 4000 );
    },
    onAttempt = function ( k, timestamp ) {
        if ( k === opt.attempts - 1 ) {
            if ( ! stop ) {
                server = server || net.createServer();
                server.on( 'close', function () {
                    stop = true;
                    ck.run();
                } );
                server.listen( opt.port );
            }
        }
    },
    onceOnline = function () {
        ck.once( 'online', onOnline );
        setTimeout( function () {
            ck.end();
        }, secs * 1000 );
    };

log( '- test Cocker reconnection-loop with %s attempts.', opt.attempts );
log( '- ok, test server is not running.' );

ck.on( 'offline', onOffline );
ck.on( 'attempt', onAttempt );

ck.once( 'online', onceOnline );

ck.run();