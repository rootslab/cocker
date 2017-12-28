/*
 * Cocker, a socket module to aggressively handle reconnection retries.
 *
 * Copyright(c) 2013-present Guglielmo Ferri <44gatti@gmail.com>
 * MIT Licensed
 */

exports.Cocker = ( function () {
    const log = console.log
        , { Socket } = require( 'net')
        , { inherits } = require( 'util' )
        , { improve, update, doString, clone, circles } = require( 'bolgia' )
        , ooo = circles
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
            const me = socket
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
            const me = this
                , is = me instanceof Cocker
                ;
            if ( ! is ) return new Cocker( opt );
            let cfg = improve( clone( opt ), sock_opt )
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
                , onError = function ( err ) {
                    // catch error if no listeners exist
                }
                ;

            // call the net.Socket / super constructor
            Socket.call( me, {} );

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
        ;

    inherits( Cocker, Socket );

    const cproto = Cocker.prototype;

    // connection
    cproto.run = function ( sock_opt ) {
        const me = this
            , upd = sock_opt && ( doString( sock_opt.connection ) === oobj )
            , sopt = update( me.options, sock_opt || {} )
            ;
        if ( upd ) configure( me, sopt.connection );
        // connect to a UNIX domain socket path
        if ( doString( sopt.path ) === ostr ) me.connect( sopt.path );
        // connect to a network socket
        else me.connect( sopt.address );
    };
    // disconnection
    cproto.bye = function ( data, encoding ) {
        const me = this
            , parent = me.constructor.super_
            ;
        me.lost = true;
        parent.prototype.end.apply( me, arguments );
    };

    // Promises

    // connect to a socket
    cproto.hunt = function ( sock_opt ) {
        const me = this
            , upd = sock_opt && ( doString( sock_opt.connection ) === oobj )
            , sopt = update( me.options, sock_opt || {} )
            ;
        if ( upd ) configure( me, sopt.connection );
        return new Promise( ( resolve, reject ) => {
            let t = 1
                , last = null
                , wmsg = 'Warning: unable to connect'
                ;
            me.on( 'attempt', ( v ) => attempts = v );
            me.on( 'error', ( err ) => last = err );
            me.on( 'lost', ( addr ) => reject( [ wmsg, last, addr, t ] ) );
            me.on( 'online', ( addr ) => resolve( [ addr, t ] ) );
            // connect to a UNIX domain socket path
            if ( doString( sopt.path ) === ostr ) me.connect( sopt.path );
            // connect to a network socket
            else me.connect( sopt.address );
        } );
    };

    // disconnect from a socket
    cproto.die = function ( data, encoding ) {
        const me = this
            , args = arguments
            , parent = me.constructor.super_
            , addr = me.options.address
            ;
        me.lost = true;
        return new Promise( ( resolve, reject ) => {
            me.on( 'error', ( err ) => reject( [ err.message, err, addr, 0 ] ) );
            me.on( 'lost', ( v ) => resolve( [ addr, 0 ] ) );
            parent.prototype.end.apply( me, args );
        } );
    };

    // try to connect using a list of optional hosts
    cproto.prey = function ( addrs ) {
        const me = this
            // chaining, recursive implementation
            , rseq = function ( arr, cback ) {
                let elog = []
                    , chain = ( arr, i ) => i === arr.length ?
                        // end of chain, reject
                        Promise.reject( elog ) :
                        Promise.resolve( cback( arr[ i ] ) ).then(
                            () => chain( arr, ++i )
                            , ( err ) => { 
                                elog.push( err );
                                return chain( arr, ++i );
                            }
                        )
                    ;
                return chain( arr, 0 );
            }
            ;

        return new Promise ( ( resolve, reject ) =>
            rseq( addrs, ( host ) => me.hunt( { address : host } )
                .then( ( args ) => resolve( args ) )
            ).catch( ( what ) => reject( [ 'what? no one around!', what ] ) ) );
    };

    return Cocker;

} )();