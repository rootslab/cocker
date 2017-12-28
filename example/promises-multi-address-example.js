/*
 * Cocker example, connect using a list of multiple hosts,
 * through native Prmoises, using Cocker#prey and Cocker#die
 */

var log = console.log
    , assert = require( 'assert' )
    , net = require( 'net' )
    , server = net.createServer()
    , Cocker = require( '../' )
    , trials = 3
    , port = 63800
    , opt = {
        address : {
            port : port + trials
        }
        , reconnection : {
            trials : trials
            , interval : 200
        }
    }
    , attempts = 0
    , ck = Cocker( opt )
    , alist = []
    ;
    
server.on( 'connection', ( sock ) => {
    let addr = sock.address()
        ;
    log( '\n- server: new socket connection', addr, '\n' );
    sock.on( 'close', ( args ) => log( '\n- server: socket closed', addr, '\n' ) );

} );

server.on( 'close', () => log( '\n- server: closed!\n' ) );
server.on( 'listening', () => log( '\n- server: listening on', server.address(), '\n' ) );

server.listen( port + trials );

for ( let i = 0; i < trials; ++i )
    alist[ i ] = { host : '127.0.0.1', port : ++port }
    ;

log( '\n- execute prey on %d host(s):\n ', trials, alist );

ck.on( 'attempt', ( v, addr ) => log( '- cocker: attempt (%d)', v, addr ) );

ck.prey( alist )
     // Promise resolved!
    .then( ( args ) => log( '- cocker: connected!', args ) )
    // close connection
    .then( () => {
        log( '- cocker: now close connection..' );
        return ck.die();
    } )
    // socket closed
    .then( ( args ) => log( '- cocker: socket closed', args ) )
    // all attempts are unsuccessful, Primose will be rejected
    .catch( ( args ) => log( '-> rejected: %s\n-> error log:\n', args[ 0 ], args[ 1 ] ) )
    // finally close server
    .then( () => server.close() )
    ;
