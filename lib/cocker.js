/*
 * Cocker, a socket module to handle reconnection retries.
 * Copyright(c) 2011 Guglielmo Ferri <44gatti@gmail.com>
 * MIT Licensed
 */

exports.version = require( '../package' ).version;
exports.Cocker = ( function () {
    var log = console.log
        , net = require( 'net')
        , path = require( 'path' )
        , util = require( 'util' )
        , Bolgia = require( 'bolgia' )
        , mix = Bolgia.mix
        , improve = Bolgia.improve
        , update = Bolgia.update
        , toString = Bolgia.toString
        , ooo = Bolgia.circles
        , abs = Math.abs
        , pow = Math.pow
        , goldenRatio = ( Math.sqrt( 5 ) + 1 ) / 2
        // Cocker options
        , sock_opt = {
            /*
             * Set readable and/or writable to true to allow reads and/or writes
             * on this socket (NOTE: Works only when fd is passed).
             */
            path : {
                fd : undefined
                , readable : true
                , writable : true
            }
            , address : { port : 0 , host : 'localhost' }
            , connection : {
                /*
                 * encoding could be: 'ascii', 'utf8', 'utf16le' or 
                 * 'ucs2','buffer'. It defaults to null or 'buffer'.
                 */
                encoding : null
                /*
                 * keepAlive defaults to true, false in net.Socket,
                 * Specify a number to set also the initialDelay.
                 */
                , keepAlive : true
                // 'timeout' event delay, default is 0 ( no timeout )
                , timeout : 0
                /*
                * noDelay is true for default, it disables the Nagle
                * algorithm ( no TCP data buffering for socket.write )
                */
                , noDelay : true
                /*
                 * If true, the socket won't automatically send a FIN
                 * packet when the other end of the socket sends a FIN
                 * packet. Defaults to false.
                 */
                , allowHalfOpen : false
            }
            // Cocker custom options
            , reconnection : {
                trials : 3
                , interval : 1000
                , factor : goldenRatio
            }
        }
        , Cocker = function ( opt ) {
            var me = this
                ;
            if ( ! ( me instanceof Cocker ) ) {
                return new Cocker( opt );
            }
            var cfg = improve( opt, sock_opt )
                , conn = cfg.connection
                , rconn = cfg.reconnection
                , onConnect = function () {
                    me.lost = false;
                    me.attempts = 1;
                    me.lapse = 0;
                    me.emit( 'online', cfg.path.fd ? cfg.path : cfg.address );
                }
                , onClose = function ( had_error ) {
                    if ( me.attempts === 1 ) {
                        me.emit( 'offline', cfg.address );
                    }
                    if ( ( me.lost && ! had_error ) ||
                         ( me.attempts > rconn.trials ) ) {
                        me.lost = true;
                        me.attempts = 1;
                        me.lapse = 0;
                        me.emit( 'lost', cfg.path.fd ? cfg.path : cfg.address );
                        return;
                    }
                    me.lapse = abs( rconn.interval * pow( rconn.factor, me.attempts + 1 ) );
                    me.emit( 'attempt', me.attempts++, cfg.path.fd ? cfg.path : cfg.address, me.lapse );
                    setTimeout( me.run.bind( me ), me.lapse );
                }
                , onError = function () {
                    // catch error
                }
                ;

            // call the net.Socket / super constructor
            me.constructor.super_.call( me, ( function () {
                var half = { allowHalfOpen : conn.allowHalfOpen };
                return toString( cfg.path.fd ) !== ooo.str ? half : mix( half, cfg.path );
            } )() );

            // set net.Socket options
            me.setNoDelay( !! conn.noDelay );

            if ( toString( conn.timeout ) === ooo.num ) {
                me.setTimeout( true, abs( conn.timeout ) );
            } else {
                me.setTimeout( 0 );
            }
            // set keepalive, using it also for getting the initialDelay
            if ( toString( conn.keepAlive ) === ooo.num ) {
                me.setKeepAlive( true, abs( conn.keepAlive ) );
            } else {
                me.setKeepAlive( !! conn.keepAlive );
            }
            if ( toString( conn.encoding ) === ooo.str ) {
                me.setEncoding( conn.encoding );
            } 

            me.options = cfg;
            // init Cocker vars
            me.lost = false;
            me.stop = false;
            me.attempts = 1;
            me.lapse = 0;

            // add event listeners
            me.on( 'connect', onConnect );
            me.on( 'close', onClose );
            me.on( 'error', onError );

        }
        , cproto
        ;

    util.inherits( Cocker, net.Socket );

    cproto = Cocker.prototype;

    // connection
    cproto.run = function ( opt ) {
        var me = this
            , cfg = toString( opt ) === ooo.obj ?
                update( me.options, opt ) :
                me.options
                ;
        // running trial
        if ( toString( cfg.path.fd ) === ooo.str ) {
            // connect to a UNIX domain socket path
            me.connect( cfg.path.fd );
        } else {
            // reset fd
            cfg.path.fd = undefined;
            // connect to a tcp socket
            me.connect( cfg.address.port, cfg.address.host );
        }
    };

   // voluntarily close the socket connection
    cproto.bye = function ( data, encoding ) {
        var me = this
            , parent = me.constructor.super_
            ;
        me.lost = true;
        parent.prototype.end.apply( me, arguments );
    };

    return Cocker;
} )();
