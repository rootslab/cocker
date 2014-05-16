var log = console.log
    , assert = require( 'assert' )
    , Cocker = require('../')
    , trials = 4
    , opt = {
        address : {
            port : 0
        }
        , reconnection : {
            trials : trials
            , interval : 200
        }
    }
    , attempts = 0
    , ck = Cocker( opt )
    ;

log( '- check the number of connection retries with no server listening, should be %d.', trials );

ck.on( 'online', function ( address ) {
    log( ' :online' );
    throw new Error( 'no server should listen on ' + opt.address.host + ':' + opt.address.port +'.' );
} );

ck.on( 'offline', function ( address ) {
    log( ' :offline' );
} );

ck.on( 'attempt', function ( k, address, lapse ) {
    log( ' :attempt', k );
    ++attempts;
} );

ck.on( 'lost', function ( address ) {
    log( ' :lost' );
    assert.equal( attempts, trials );
} );

ck.run();