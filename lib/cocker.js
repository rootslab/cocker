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
        , { lookup } = require( 'dns' )
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
            address : {
                port : 0
                , host : '127.0.0.1'
                , family : null
                // local address the socket should connect from.
                // , localAddress : void 0 
                // local port the socket should connect from.
                // , localPort: void 0
                // optional dns.lookup() hints.
                // , hints : 0
                // custom lookup function. default is dns.lookup()
                // , lookup : lookup 
                // IPC endpoint, as for unix domain socket
                , path : null
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
        // Promise chaining of a sequence, recursive implementation
        , chainseq = function ( arr, cback ) {
            let elog = []
                , chain = ( arr, i ) => i === arr.length ?
                    // end of chain, reject
                    Promise.reject( elog ) :
                    Promise.resolve( cback( arr[ i ] ) ).then(
                        // stop chaining when resolved
                        () => void 0
                        // push current error and continue 
                        , ( err ) => {
                            elog.push( err );
                            return chain( arr, ++i );
                        }
                    )
                ;
            return chain( arr, 0 );
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
                , onConnect = () => {
                    me.lost = false;
                    me.attempts = 1;
                    me.lapse = 0;
                    me.emit( 'online', cfg.address.path || cfg.address );
                }
                , onClose = ( had_error ) => {
                    if ( me.attempts === 1 ) me.emit( 'offline', cfg.address, had_error );
                    if ( ( me.lost && ! had_error ) ||
                         ( me.attempts > rconn.trials ) ) {
                        me.lost = true;
                        me.attempts = 1;
                        me.lapse = 0;
                        me.emit( 'lost', cfg.address.path || cfg.address );
                        return;
                    }
                    me.lapse = ceil( abs( rconn.interval * pow( rconn.factor, me.attempts + 1 ) ) );
                    me.emit( 'attempt', me.attempts++, cfg.address.path || cfg.address, me.lapse );
                    setTimeout( me.run.bind( me ), me.lapse );
                }
                , onError = ( err ) => {
                    // catch errors
                }
                ;

            // call the net.Socket / super constructor
            Socket.call( me, {} );

            // update Socket configuration options
            configure( me, conn );

            // initialize properties
            me.options = cfg;
            me.lost = false;
            me.attempts = 1;
            me.lapse = 0;

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
        if ( doString( sopt.address.path ) === ostr ) 
            me.connect( sopt.address.path );
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
            , address = sopt.address
            , ipc = doString( address.path ) === ostr
            ;
        
        if ( upd ) configure( me, sopt.connection );
        // build Promise
        let online = new Promise ( ( resolve, reject ) => {
            // resolve Promise when online
            me.once( 'online', ( addr ) => {
                // stop also looping
                me.attempts = Infinity;
                resolve( [ addr ] );
            } );
            // reject Promise when connection is definitively lost
            me.once( 'lost', ( addr ) => reject( Error( 'hunt failed!' ) ) );
            // connect to a network socket or IPC endpoint
            me.connect( ipc ? address.path : address );
        } );
        
        return online;

    };

    cproto.watch = function ( sock_opt ) {
        const me = this
            , upd = sock_opt && ( doString( sock_opt.connection ) === oobj )
            , sopt = update( me.options, sock_opt || {} )
            , address = sopt.address
            , ipc = doString( address.path ) === ostr
            ;
        
        let pat = new Promise ( ( resolve, reject ) => {
            me.once( 'lost', ( addr ) => {
                me.hunt().then( ( addr ) => resolve( addr ) )
                .catch( ( what ) => reject( what ) );
            } );
        } );
        return pat;
    };

    // try to connect using a list of optional hosts
    cproto.prey = function ( addrs ) {
        const me = this
            ;
        return new Promise ( ( resolve, reject ) =>
            chainseq( addrs, ( host ) => me.hunt( { address : host } )
                .then( ( arr ) => resolve( arr ) )
            ).catch( ( what ) => reject( what ) ) );
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
            // me.once( 'error', ( err ) => reject( [ err.message, err, addr ] ) );
            me.once( 'lost', ( v ) => resolve( [ addr ] ) );
            parent.prototype.end.apply( me, args );
        } );
    };

    return Cocker;

} )();