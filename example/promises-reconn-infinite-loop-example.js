/*
 * Cocker example, infinite hunt/watch loop
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
    , delay = ( t ) => new Promise ( ( solve ) => setTimeout( solve, t ) )
    , destroy = ( socket, min, max ) => {
        min = + min || 0;
        max = + max || 4000;
        let lapse = min + floor( random() * ( max - min + 1 ) )
            ;
        delay( lapse ).then( ( lapse ) =>
            log( '- server: destroy socket!' ) &
            socket.destroy()
            );
        return lapse;
    }
    , sock = null
    , handle = ( s ) => {
        let saddr = s.address()
            ;
        log( '- server: new connection from', saddr );
        s.on( 'close', () => log( '- server: socket connection closed!', saddr ) );
        // silly way to save socket reference
        sock = s;
    }
    // flag to stop recursion
    , stop = 0
    // recursive loop
    , loophunt = () =>
        ck.hunt().then( stop || loopwatch, stop || loophunt )
    , loopwatch = () =>
        ck.watch().then( stop || loopwatch, stop || loophunt )
    ;

// log Cocker events
ck.on( 'attempt', ( t, addr, lapse ) => 
    log( '- cocker: (%d) attempt (%ds)', t, lapse / 1000 ) );
ck.on( 'online', ( addr, haderr ) => log( '- cocker: online!' ) );
ck.on( 'offline', ( addr, haderr ) => log( '- cocker: offline!' ) );
ck.on( 'lost', ( v ) => log( '- cocker: lost!' ) );
ck.on( 'connect', ( v ) => log( '- cocker: connect!' ) );
ck.on( 'close', ( v ) => log( '- cocker: close!' ) );

// log server events
server.on( 'listening', ( v ) => log( '- server listening on:', server.address() ) );
server.on( 'close', () => log( '- server: close!' ) );

// handle socket connection
server.on( 'connection', handle );

// you can run the hunt loop before that the server is listening
var ploop = loophunt().catch( ( reason ) => log( '\n- error catched:\n', reason, '\n' ) )

// listen on wrong port
server.listen( 1 + port );

// simulate server multiple crash and reboot
delay( 4000 ).then( () => 
    server.close() &
    server.listen( port )
    );

delay( 8000 ).then( () =>
    destroy( sock ) &
    server.close()
    );

delay( 14000 ).then( () =>
    server.listen( port )
    // uncomment this line to stop looping (Promise rejection)
    // & ( stop = true )
    );

delay( 22000 ).then( () =>
    destroy( sock ) &
    server.close()
    );

delay( 35000 ).then( () =>
    server.listen( port )
    );
