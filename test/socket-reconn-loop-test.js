module.exports = function ( done ) {

    var log = console.log
        , assert = require( 'assert' )
        , net = require( 'net' )
         floor = Math.floor
        , random = Math.random
        , now = Date.now
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
        , attempts = 0
        , ck = Cocker( opt )
        , exit = typeof done === 'function' ? done : function () {}
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

    log( '- test re-connections with address:', ck.options.address );

    log( '- check the number of connection retries with no server listening, should be %d.', trials );

    ck.on( 'online', function ( address ) {
        log( ' :online' );
    } );

    ck.on( 'offline', function ( address ) {
        log( ' :offline' );
    } );

    ck.on( 'attempt', function ( k, address, lapse ) {
        log( ' :attempt %d (%d secs)', k, ( lapse / 1000 ).toFixed( 1 ) );
    } );

    ck.on( 'lost', function ( address ) {
        log( ' :lost' );
        // exit test
        exit();
    } );

    // log close event for server
    server.on( 'close', () => log( '-> server: close!' ) );
    server.on( 'connection', handle );
    server.listen( 63800 );

   ck.run();

};

// single test execution with node
if ( process.argv[ 1 ] === __filename ) module.exports();