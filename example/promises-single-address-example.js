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
    log( '\n- server: new connection from', caddr );
    v.on( 'close', () =>
        log( '- server: closed connection!', caddr )
    );
} );

server.on( 'close', () => log( '- server: I close!' ) );

server.listen( 63800 );

ck.on( 'attempt', ( t, addr, lapse ) => 
    log( '- cocker: (%d) attempt (%ds)', t, lapse / 1000 ) );

ck.on( 'lost', ( v ) => log( '- cocker: lost!' ) );

server.on( 'listening', function () {

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

} );