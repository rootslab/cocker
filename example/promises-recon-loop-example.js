/*
 * Cocker example, connect to a socket, through native Prmoises,
 * using Cocker#hunt and Cocker#die
 */
var log = console.log
    , floor = Math.floor
    , random = Math.random
    , now = Date.now
    , assert = require( 'assert' )
    , net = require( 'net' )
    , server = net.createServer()
    , Cocker = require( '../' )
    , trials = 4
    , opt = {
        address : {
            port : 63800
        }
        , reconnection : {
            trials : trials
            , interval : 200
        }
    }
    , attempts = 0
    , ck = Cocker( opt )
    , sock = null
    , delay = ( t ) => new Promise ( ( solve ) => setTimeout( solve, t ) )
    , destroy = ( socket, min, max ) => {
        min = + min || 0;
        max = + max || 4000;
        let lapse = min + floor( random() * ( max - min + 1 ) )
            ;
        return delay( lapse ).then( () => socket.destroy() );
    }    
    ;

ck.on( 'online', ( v ) => log( '-> cocker: online!' ) );
ck.on( 'offline', ( v, haderr ) => log( '-> cocker: offline! (err:%s)', haderr ) );
ck.on( 'attempt', ( v ) => log( '-> cocker: attempt (%d)', v ) );
ck.on( 'close', ( v ) => log( '-> cocker: close!' ) );
ck.on( 'lost', ( v ) => log( '-> cocker: lost!' ) );


log();

server.on( 'connection', ( s ) => {
    let caddr = s.address()
        ;
    // silly way to hold socket
    sock = s;
    
    log( '-> server: new connection!' );

    s.once( 'close', () =>
        log( '-> server: socket was closed!' )
    );
    
    log( '-> server: socket will be destroyed' );
    // voluntariy destroy socket
    destroy( sock );

} );

server.on( 'close', () => log( '-> server: I close!' ) );

server.listen( 63800 );

server.on( 'listening', () => {

    ck.hunt().then( ( args ) => {
        log( '\n(hunt resolved) %d\n', now() );
    }, ( args ) => {
        log( '\n(hunt rejected) %d\n', now() );
    } ). catch( ( what ) => {
        log( '\n(hunt catched) %d\n', now(), what );
    } );

} );

ck.on( 'online', () => {

    ck.watch().then( ( args ) => {
        log( '\n(watch resolved) %d\n', now() );
    }, ( args ) => {
        log( '\n(watch rejected) %d\n', now() );
    } ).catch( ( what ) => {
        log( '\n(watch catched) %d\n', now(), what );
    } );

} );

