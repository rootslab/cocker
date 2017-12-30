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
    , handle = ( v ) => {
        let caddr = v.address()
            ;
        log( '- server: new connection from', caddr );
        v.on( 'close', () =>
            log( '- server: closed connection!', caddr )
        );
    }
    ;
    
// log Cocker events
ck.on( 'attempt', ( t, addr, lapse ) => 
    log( '- cocker: (%d) attempt (%ds)', t, lapse / 1000 ) );
ck.on( 'offline', ( addr, haderr ) => log( '- cocker: offline!' ) );
ck.on( 'lost', ( v ) => log( '- cocker: lost!' ) );

// run hunt before server is listening
ck.hunt().then( ( addr ) => {

    log( '- cocker: connected to', addr );
    
    log( '- cocker: now I will die!'  );

    return ck.die();

} ).then( ( addr ) => {

    log( '- cocker: disconnected from', addr );

    server.close();

    log( '- cocker: try to reconnect to:', ck.options.address );
    return ck.hunt();

} ).catch( ( reason ) => log( '\n- error catched:', reason, '\n' ) );

server.on( 'close', () => log( '- server: I close!' ) );
// handle socket connection
server.on( 'connection', handle );
// listen
server.listen( port );
