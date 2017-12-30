/*
 * Cocker example, connect using a list of multiple hosts,
 * through native Prmoises, using Cocker#prey and Cocker#die
 */

var log = console.log
    , assert = require( 'assert' )
    , net = require( 'net' )
    , server = net.createServer()
    , Cocker = require( '../' )
    , trials = 4
    , port = 63800
    , opt = {
        address : {
            port : 0
        }
        , reconnection : {
            trials : trials
            , interval : 100
        }
    }
    , attempts = 0
    , ck = Cocker( opt )
    , alist = []
    ;
    
server.on( 'connection', ( sock ) => {
    let addr = sock.address()
        ;
    log( '- server: new socket connection', addr );
    sock.on( 'close', ( args ) => log( '- server: socket closed', addr ) );

} );

server.on( 'close', () => log( '- server: closed!' ) );
server.on( 'listening', () => log( '\n- server: listening on', server.address() ) );

// server listen on the last resulting port
server.listen( port + trials );

for ( let i = 0; i < trials; ++i )
    alist[ i ] = { host : '127.0.0.1', port : ++port }
    ;

log( '\n- execute prey on %d host(s):\n ', trials, alist );

ck.on( 'attempt', ( v, addr, lapse ) =>
    log( '- cocker: (%d) attempt (%ds)', v, lapse / 1000, addr ) );
ck.on( 'offline', ( addr, haderr ) => log( '- cocker: offline!' ) );
ck.on( 'lost', ( v ) => log( '- cocker: lost!' ) );

ck.prey( alist )
    // Promise resolved!
    .then( ( args ) => log( '- cocker: connected!', args[ 0 ] ) )
    // close connection
    .then( () => {
        log( '- cocker: close connection..' );
        return ck.die();
    } )
    // socket closed
    .then( ( args ) => log( '- cocker: socket closed', args[ 0 ] ) )
    // all attempts are unsuccessful, Primose will be rejected
    .catch( ( what ) => log( '-> rejected: \n-> error log:\n', what ) )
    // finally close server
    .then( () => server.close() )
    ;
