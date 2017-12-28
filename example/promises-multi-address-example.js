
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
    .then( ( args ) => log( '- cocker: connected!', args ) )
    .then( () => {
        log( '- cocker: now close connection..' );
        return ck.die();
    } )
    .then( ( args ) => log( '- cocker: socket closed', args ) )
    .catch( ( args ) => log( '-> rejected: %s\n-> error log:\n', args[ 0 ], args[ 1 ] ) )
    .then( () => server.close() )
    ;
