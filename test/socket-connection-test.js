module.exports = function ( done ) {

    var log = console.log
        , assert = require( 'assert' )
        , net = require( 'net' )
        , server = net.createServer()
        , Cocker = require('../')
        , trials = 6
        , opt = {
            address : {
                port : 6379
            }
            , reconnection : {
                trials : trials
                , interval : 200
            }
        }
        , attempts = 0
        , ck = Cocker( opt )
        , evts = []
        , exit = typeof done === 'function' ? done : function () {}
        ;

    log( '- test re-connections with address:', ck.options.address );

    log( '- check the number of connection retries with no server listening, should be %d.', trials );

    ck.on( 'online', function ( address ) {
        log( ' :online' );
        evts.push( 'online' );
        setTimeout( function () { ck.bye(); }, 2000 );
    } );

    ck.on( 'offline', function ( address ) {
        log( ' :offline' );
        evts.push( 'offline' );
    } );

    ck.on( 'attempt', function ( k, address, lapse ) {
        log( ' :attempt %d (%d secs)', k, ( lapse / 1000 ).toFixed( 1 ) );
        ++attempts;
    } );

    ck.on( 'lost', function ( address ) {
        log( ' :lost' );
        evts.push( 'lost' );
        assert.deepEqual( evts, [ 'online', 'offline', 'lost' ] );
        server.close();
        exit();
    } );

    server.listen( 6379 );

    // force test coverage passing options
    ck.run( {
        connection : {
            // bad type for timeout
            timeout : 'notanumber'
            , encoding : 'utf8'
            , keepAlive : 1000
        }
    } );

};