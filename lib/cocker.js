/*
 * Cocker, a socket module to handle reconnection retries.
 * Copyright(c) 2015 Guglielmo Ferri <44gatti@gmail.com>
 * MIT Licensed
 */

exports.version = require( '../package' ).version;
exports.Cocker = ( function () {
    var net = require( 'net')
        , util = require( 'util' )
        , Bolgia = require( 'bolgia' )
        , improve = Bolgia.improve
        , update = Bolgia.update
        , doString = Bolgia.doString
        , clone = Bolgia.clone
        , ooo = Bolgia.circles
        , onum = ooo.num
        , ostr = ooo.str
        , oobj = ooo.obj
        , abs = Math.abs
        , pow = Math.pow
        , ceil = Math.ceil
        , goldenRatio = ( Math.sqrt( 5 ) + 1 ) / 2
        // Cocker options
        , sock_opt = {
            // file path for unix domain socket
            path : null
            , address : {
                port : 0
                , host : '127.0.0.1'
                , family : null
            }
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
        , configure = function ( socket, conn_opt ) {
            var me = socket
                , conn = conn_opt
                ;
            // set net.Socket options
            me.allowHalfOpen = conn.allowHalfOpen;
            me.setNoDelay( !! conn.noDelay );

            if ( doString( conn.timeout ) === onum ) me.setTimeout( abs( conn.timeout ) );
            else me.setTimeout( 0 );

            // set keepalive, using it also for getting the initialDelay
            if ( doString( conn.keepAlive ) === onum ) me.setKeepAlive( true, abs( conn.keepAlive ) );
            else me.setKeepAlive( !! conn.keepAlive );

            if ( doString( conn.encoding ) === ostr ) me.setEncoding( conn.encoding );
        }
        , Cocker = function ( opt ) {
            var me = this
                , is = me instanceof Cocker
                ;
            if ( ! is ) return new Cocker( opt );
            var cfg = improve( clone( opt ), sock_opt )
                , conn = cfg.connection
                , rconn = cfg.reconnection
                , onConnect = function () {
                    me.lost = false;
                    me.attempts = 1;
                    me.lapse = 0;
                    me.emit( 'online', cfg.path || cfg.address );
                }
                , onClose = function ( had_error ) {
                    if ( me.attempts === 1 ) me.emit( 'offline', cfg.address );
                    if ( ( me.lost && ! had_error ) ||
                         ( me.attempts > rconn.trials ) ) {
                        me.lost = true;
                        me.attempts = 1;
                        me.lapse = 0;
                        me.emit( 'lost', cfg.path || cfg.address );
                        return;
                    }
                    me.lapse = ceil( abs( rconn.interval * pow( rconn.factor, me.attempts + 1 ) ) );
                    me.emit( 'attempt', me.attempts++, cfg.path || cfg.address, me.lapse );
                    setTimeout( me.run.bind( me ), me.lapse );
                }
                , onError = function () {
                    // catch error
                }
                ;

            // call the net.Socket / super constructor
            me.constructor.super_.call( me, {} );
            // update Socket configuration options
            configure( me, conn );

            // init Cocker vars
            me.lost = false;
            me.stop = false;
            me.attempts = 1;
            me.lapse = 0;

            me.options = cfg;

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
    cproto.run = function ( sock_opt ) {
        var me = this
            , upd = sock_opt && ( doString( sock_opt.connection ) === oobj )
            , sopt = update( me.options, sock_opt || {} )
            ;
        if ( upd ) configure( me, sopt.connection );
        // connect to a UNIX domain socket path
        if ( doString( sopt.path ) === ostr ) me.connect( sopt.path );
        // connect to a network socket
        else me.connect( sopt.address );
    };

    // voluntarily close the socket connection, args:  data, encoding
    cproto.bye = function () {
        var me = this
            , parent = me.constructor.super_
            ;
        me.lost = true;
        parent.prototype.end.apply( me, arguments );
    };

    return Cocker;
} )();