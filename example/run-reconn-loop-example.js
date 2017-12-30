/*
 * Cocker reconnection loop example with #run
 */

var log = console.log
    , net = require( 'net' )
    , floor = Math.floor
    , random = Math.random
    , Cocker = require('../')
    , trials = 6
    , opt = {
        address : {
            port : 63800
        }
        , reconnection : {
            trials : trials
            , interval : 200
        }
    }
    , ck = Cocker( opt )
    , exit = typeof done === 'function' ? done : function () {}
    // some utils
    , delay = ( t ) => new Promise ( ( solve ) => setTimeout( solve, t ) )
    , destroy = ( socket, min, max ) => {
        min = + min || 0;
        max = + max || 4000;
        let lapse = min + floor( random() * ( max - min + 1 ) )
            ;
        delay( lapse ).then( ( lapse ) => socket.destroy() );
        return lapse;
    }
    , server = net.createServer()
    , sock = null
    // server connection handling for simulate random crash
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

log( '\n- example of re-connection using Cocker#run, address:', ck.options.address );

// log events for cocker client
ck.on( 'attempt', ( k, address, lapse ) =>
    log( ' :attempt %d (%d secs)', k, ( lapse / 1000 ).toFixed( 1 ) ) );
ck.on( 'online', ( address ) => log( ' :online' ) );
ck.on( 'offline', ( address ) => log( ' :offline' ) );
// on lost, exit test
ck.on( 'lost', ( address ) => log( ' :lost' ) & exit() );


// log close event for server
server.on( 'close', () => log( '-> server: close!' ) );
server.on( 'connection', handle );
server.listen( 63800 );

// run loop
ck.run();