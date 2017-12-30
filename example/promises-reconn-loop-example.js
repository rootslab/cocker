/*
 * Cocker example, mixing #watch and #hunt Promises
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
    , port = 63800
    , opt = {
        address : {
            port : port
        }
        , reconnection : {
            trials : trials
            , interval : 200
        }
    }
    , attempts = 0
    , ck = Cocker( opt )
    , sock = null
    // utils
    , delay = ( t ) => new Promise ( ( solve ) => setTimeout( solve, t ) )
    , destroy = ( socket, min, max ) => {
        min = + min || 0;
        max = + max || 4000;
        let lapse = min + floor( random() * ( max - min + 1 ) )
            ;
        delay( lapse ).then( ( lapse ) => socket.destroy() );
        return lapse;
    }
    // server connection handling
    , handle = ( s ) => {

        log( '-> server: new connection!' );

        s.once( 'close', () => log( '-> server: socket was closed!' ) );
        
        // server goes down after max 5 secs
        let d = ( 5 * random() ).toFixed( 2 ) * 1000
            ;
        if ( ! sock )
            log( '-> server: will crash in %d secs!', d / 1000 ) &
            delay( d ).then( () =>
                log( '-> server: destroy!' ) &
                sock.destroy() &
                server.close()
            );
        
        // voluntariy destroy socket in casual time
        d = destroy( s, 1000, 3000 );
        log( '-> server: socket will be destroyed in %d secs', d / 1000 );

        // silly way to hold socket
        sock = s;
    }
    // Promises 
    , hunting = () => {
        log( '\n(hunt pending) %d\n', now() );
        return ck.hunt()
            .then( ( args ) => {
                log( '(hunt resolved) %d\n', now() );
            }, ( args ) => {
                log( '\n(hunt rejected) %d\n', now() );
            } ). catch( ( what ) => {
                log( '\n(hunt catched) %d\n', now(), what );
            } );
    }
    , watching = () => {
        log( '\n(watch pending) %d\n', now() );
        return ck.watch()
            .then( ( args ) => {
                log( '(watch resolved) %d\n', now() );
            }, ( args ) => {
                log( '\n(watch rejected) %d\n', now() );
            } ).catch( ( what ) => {
                log( '\n(watch catched) %d\n', now(), what );
            } );
    }
    ;

// log events for client
ck.on( 'online', ( addr ) => log( '-> cocker: online!' ) );
ck.on( 'offline', ( addr, haderr ) => log( '-> cocker: offline!' ) );
ck.on( 'attempt', ( t, addr, lapse ) => log( '-> cocker: (%d) attempt (%ds)', t, lapse / 1000 ) );
ck.on( 'close', ( v ) => log( '-> cocker: close!' ) );
ck.on( 'lost', ( addr ) => log( '-> cocker: lost!' ) );
// log close event for server
server.on( 'close', () => log( '-> server: close!' ) );

// watch connection 
ck.on( 'online', watching );

// start #hunt before the server is listening, or
// simply connect when the server is listening:
// server.on( 'listening', hunt );
hunting();

// handle socket for simulating crashes
server.on( 'connection', handle );
server.listen( port );

log( '-> server: listening on port %d', port );
