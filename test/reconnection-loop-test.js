var log = console.log,
    assert = require( 'assert' ),
    net = require( 'net' ),
    Cocker = require('../'),
    opt = {
        debug : !true,
        // host : 'localhost',
        port : 50000,
        attempts : 3
    },
    ck = Cocker( opt ),
    server = null,
    secs = 2,
    stopTest = false,
    // some listeners
    onOffline = function () {
        log( '- client is now offline.' );
    },
    onOnline = function () {
        log( '- connection was successfully re-established.' );
        log( '- closing connection and disabling reconnection-loop.' );
        ck.bye();
        log( '- closing server.' );
        server.close();
        if ( stopTest ) { return; }
        log( '- re-enabling reconnection-loop within %ss.', secs * 2 );
        setTimeout( function () {
            ck.run();
        }, secs * 2000 );
    },
    onAttempt = function ( k, timestamp ) {
        log( '  > connection attempt %d (after %ds) on', k, ck.lapse, timestamp );
        if ( k === opt.attempts ) {
            server = server || net.createServer().listen( opt.port );
            log( '- server listening on localhost:' + opt.port );
        }
    },
    onceLost = function () {
        log( '- connection was lost.' );
        log( '- re-enabling server.' );
        server.listen( opt.port );
        stopTest = true;
        setTimeout( function () {
           ck.run();
        }, secs * 1000 );
    },
    onceOnline = function () {
        log( '- connection was successfully established.' );
        ck.on( 'online', onOnline );
        log( '- disconnect within %ss without disabling reconnection-loop.', secs );
        setTimeout( function () {
            ck.end();
        }, secs * 1000 );
    };

log( '- test Cocker reconnection-loop with %s attempts.', opt.attempts );

ck.on( 'offline', onOffline );
ck.on( 'attempt', onAttempt );

ck.once( 'lost', onceLost );
ck.once( 'online', onceOnline );

ck.run();