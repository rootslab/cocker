/*
 * Cocker example, connect to a socket, through native Prmoises,
 * using Cocker#hunt and Cocker#die
 */
var log = console.log
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
    ;
    
server.on( 'connection', ( v ) => {
    let caddr = v.address()
        ;
    log( '- server: new connection from', caddr );
    v.on( 'close', () =>
        log( '- server: closed connection!', caddr )
    );
} );

server.on( 'close', () => log( '- server: I close!' ) );

server.listen( 63800 );

ck.on( 'attempt', ( v ) => log( '- cocker: attempt (%d)', v ) );

ck.hunt().then( ( [ addr, t ] ) => {

    log( '- cocker: (attempts %d) connected to', t, addr );
    
    log( '- cocker: now I will die!'  );

    return ck.die();

} ).then( ( addr ) => {

    log( '- cocker: disconnected from', addr );

    server.close();

    log( '- cocker: reconnect to', ck.options.address );
    return ck.hunt();

} ).catch( ( reason ) => log( '- error catched:', reason ) );
