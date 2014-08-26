module.exports = function ( done ) {

    var log = console.log
        , assert = require( 'assert' )
        , Cocker = require('../')
        , trials = 4
        , opt = {
            path : '/tmp/a.redis.sock'
            , address : {
                port : 0
            }
            , reconnection : {
                trials : trials
                , interval : 500
            }
        }
        , attempts = 0
        , ck = Cocker( opt )
        , exit = typeof done === 'function' ? done : function () {}
        ;

    log( '- test re-connections with filepath: %s"', ck.options.path );

    log( '- the number of connection retries with no server listening, should be %d.', trials );

    ck.on( 'online', function ( address ) {
        var emsg = 'Sorry, no server should running/listening on "' + opt.path + '".'
            ;
        log( ' :online' );
        throw new Error( emsg );
    } );

    ck.on( 'offline', function ( address ) {
        log( ' :offline' );
    } );

    ck.on( 'attempt', function ( k, address, lapse ) {
        log( ' :attempt %d (%d secs)', k, ( lapse / 1000 ).toFixed( 1 ) );
        ++attempts;
    } );

    ck.on( 'lost', function ( address ) {
        log( ' :lost' );
        assert.equal( attempts, trials );
        exit();
    } );

    ck.run();

};