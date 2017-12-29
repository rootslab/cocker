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
    , delay = ( t ) => new Promise ( ( solve ) => setTimeout( solve, t ) )
    , destroy = ( socket, min, max ) => {
        min = + min || 0;
        max = + max || 4000;
        let lapse = min + floor( random() * ( max - min + 1 ) )
            ;
        delay( lapse ).then( ( lapse ) => socket.destroy() );
        return lapse;
    }
    , hunt = () => {
        ck.hunt().then( ( args ) => {
            log( '\n(hunt resolved) %d\n', now() );
        }, ( args ) => {
            log( '\n(hunt rejected) %d\n', now() );
        } ). catch( ( what ) => {
            log( '\n(hunt catched) %d\n', now(), what );
        } );
    }
    , watch = () => {
        ck.watch().then( ( args ) => {
            log( '\n(watch resolved) %d\n', now() );
        }, ( args ) => {
            log( '\n(watch rejected) %d\n', now() );
        } ).catch( ( what ) => {
            log( '\n(watch catched) %d\n', now(), what );
        } );
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
    ;

// log events for client
ck.on( 'online', ( addr ) => log( '-> cocker: online!' ) );
ck.on( 'offline', ( addr, haderr ) => log( '-> cocker: offline!' ) );
ck.on( 'attempt', ( t, addr, lapse ) => log( '-> cocker: (%d) attempt (%ds)', t, lapse / 1000 ) );
ck.on( 'close', ( v ) => log( '-> cocker: close!' ) );
ck.on( 'lost', ( addr ) => log( '-> cocker: lost!' ) );
// log close event for server
server.on( 'close', () => log( '-> server: close!' ) );

// watch loop 
ck.on( 'online', watch );

// handle socket, to simulate crash
server.on( 'connection', handle );
// simply connect when the server is listening
server.on( 'listening', hunt );

log( '\n- server: listening on port %d', port );

server.listen( port );

