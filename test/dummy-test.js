var log = console.log,
    assert = require( 'assert' ),
    Cocker = require('../'),
    opt = {
        debug : !!true,
        // host : 'localhost',
        // port ; 6379,
        attempts : 3
    }
    ck = Cocker();

ck.on( 'online', function ( address, timestamp ) {
    // connection is established ( on 'connect' event )
} );

ck.on( 'offline', function ( timestamp ) {
    /*
     * connection is down ( on 'close' event )
     * now it will try to reconnect opt.attempts times. 
     */
} );

ck.on( 'lost', function ( timestamp ) {
    // connection is definitively lost ( after opt.attempts times )
} );

ck.on( 'slowdown', function ( readyState, bufferSize ) {
    /*
     * commands are not written to socket, but buffered in memory
     * ( the socket connection is slow or not fully established )
     * returns -1 if bufferSize is undefined.
     */
} );

ck.on( 'lost', function ( timestamp ) {
    // connection is definitively lost ( after opt.attempts times )
} );


ck.on( 'info', function () {
    // informational event for logging
} );

ck.on( 'warning', function () {
    // warning event for loggin
} );

ck.on( 'error', function ( err ) {
    // error
} );

ck.on( 'timeout', function ( timestamp ) {
    // signal socket timeout
} );

ck.on( 'data', function ( data ) {
    // data received
} );

// other events for net.Socket

ck.on( 'connect', function () {
} );

ck.on( 'close', function ( hadError ) {
} );


// c.run();