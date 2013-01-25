/*
 * Cocker, a socket module with reconnection logic.
 * Copyright(c) 2011 Guglielmo Ferri <44gatti@gmail.com>
 * MIT Licensed
 */

exports.version = require( '../package' ).version;
exports.Cocker = ( function () {
    // 'use strict';
    var log = console.log,
        net = require( 'net'),
        path = require( 'path' ),
        util = require( 'util' ),
        goldenRatio = ( Math.sqrt( 5 ) + 1 ) / 2,
        // method to mix configuration properties
        mix = function ( dest, src ) {
            if ( ! src ) {
                // src is not an object
                return dest;
            }
            var keys = Object.keys( src ),
                i = keys.length,
                k;
            while ( i-- ) {
                k = keys[ i ];
                dest[ k ] = src[ k ];
            }
            return dest;
        },
        // Cocker
        Cocker = function ( opt ) {
            var me = this,
                cfg = null;
            if ( ! ( me instanceof Cocker ) ) {
                return new Cocker( opt );
            }
            // init options
            me.options = cfg = mix( {
                port : 6379,
                host : 'localhost',
                // 'ascii', 'utf8', 'utf16le' ('ucs2'), 'ascii', or 'hex'.
                encoding : null,
                // false, or initialDelay in ms
                keepAlive : false,
                timeout : 2000,
                /*
                 * it defaults to false.
                 * true for disabling the Nagle algorithm 
                 * ( no TCP data buffering for socket.write )
                 */
                noDelay : false,
                // fd - path
                fd : undefined,
                 // 'tcp4', 'tcp6', or 'unix'
                type : null,
                allowHalfOpen : false,
                // Cocker custom options
                attempts : 3,
                retryInterval : 1000,
                retryFactor : goldenRatio,
                // logging to console
                debug : false
            }, opt || {} );

            // for counting trials
            me.attempts = 0;
            // connection is definitively lost
            me.lost = false;
            // current lapse of time to wait for the next connection attempt
            me.lapse = 0;

            // call the net.Socket / super constructor
            me.constructor.super_.call( me, {
                // NOTE - use path instead of fd, for not getting errors
                path : cfg.fd || cfg.path,
                type : cfg.type,
                allowHalfOpen : cfg.allowHalfOpen
            } );

            if ( cfg.encoding ) {
                /* 
                 * Note! set the encoding if it was specified;
                 * if the value is null, it defaults to 'utf8'.
                 */
                me.setEncoding( cfg.encoding );
            }
            me.setNoDelay( cfg.noDelay );
            me.setTimeout( cfg.timeout );
            me.setKeepAlive.apply( me, cfg.keepAlive ? [ true, cfg.keepAlive ] : [ false ] );

            /*
             * Some listeners. Possible events are :
             * 'connect', 'data', 'end', 'timeout', 'drain', 'error', 'close'
             */
            var onEnd = function () {
                    me.bark( 'offline', Date.now() );
                    /*
                     * Emitted when the other end of the socket sends a FIN packet.
                     * By default (allowHalfOpen == false) the socket will destroy
                     * its file descriptor once it has written out its pending write
                     * queue. However, by setting allowHalfOpen == true, the socket 
                     * will not automatically end()s its side, allowing the user to 
                     * write arbitrary amounts of data, with the caveat that the user
                     * is required to end() his side now.
                     */
                    if ( me.lost ) {
                        me.bark( 'info', 'connection ends.' );
                    } else {
                        me.bark( 'warning', 'connection was closed.' );
                    }
                },
                onLost = function () {
                    me.attempts = 0;
                    me.lapse = 0;
                    me.lost = true;
                },
                onConnect = function () {
                    me.lost = false;
                    me.attempts = 0;
                    // emit online event
                    me.bark( 'online', me.address() || { path : me.options.fd }, Date.now() );
                },
                onClose = function ( had_error ) {
                    var wmsg = null,
                        interval = 0,
                        secs = 0;

                    if ( cfg.debug ) {
                        log( 'close', had_error ? 'with error' : 'without error' );
                    }
                    /*
                     * Emitted once the socket is fully closed. 
                     * had_error is a boolean which says if the socket
                     * was closed due to a transmission error.
                     */
                    if ( had_error || ( ! me.lost ) ) {
                        if ( me.attempts < cfg.attempts ) {
                            // TODO use timers ?
                            interval = cfg.retryInterval * Math.pow( me.attempts + 1, cfg.retryFactor );
                            secs =  ( interval / 1000 ).toFixed( 2 );
                            // wmsg = 'current connection attempt was unsuccessful!! (' + me.attempts + '), retrying in ' + secs + ' secs';
                            // me.bark( 'warning', wmsg );
                            // hold current time interval for the next attempt
                            me.lapse = Math.round( interval );
                            // re-run connection attempt
                            setTimeout( me.run.bind( me ), interval );
                        } else {
                            wmsg = 'the maximum connection attempts (' + cfg.attempts + ') were reached.';
                            me.bark( 'warning', wmsg );
                            me.attempts = 0;
                            me.lost = true;
                            me.lapse = 0;
                            me.bark( 'lost', 'connection was lost.', Date.now() );
                        }
                    }
                },
                onError = function ( err ) {
                    // log the error, but don't bubble up
                    if ( cfg.debug ) {
                        log( 'error', err.message ); // , err.stack );
                    }
                };
            // add event listeners
            me.on( 'connect', onConnect );
            me.on( 'end', onEnd );
            me.on( 'close', onClose );
            me.on( 'error', onError );
            // listener for custom lost event
            me.on( 'lost', onLost );
            // add console logging if debug option is true
            if ( cfg.debug ) {
                // set event listeners for 'data', 'timeout' and 'drain'.
                var slice = Array.prototype.slice,
                    lfn = function ( name ) {
                        return function () {
                            log( name, [ Date.now() ].concat( slice.call( arguments, 0 ) ) );
                        };
                    };
                me.on( 'data', lfn( 'data' ) );
                me.on( 'timeout', lfn( 'timeout' ) );
                me.on( 'drain', lfn( 'drain' ) );
            }
        },
        cproto;

    util.inherits( Cocker, net.Socket );

    cproto = Cocker.prototype;

    // connect
    cproto.run = function ( opt ) {
        var me = this,
            cfg = ( opt ) ? mix( me.options, opt ) : me.options,
            str = null,
            attempts = me.attempts++;

        if ( cfg.fd ) {
            // connect to a UNIX domain socket path
            cfg.type = 'unix';
            cfg.noDelay = true;
            me.connect( cfg.fd || cfg.path );
        } else {
            // connect to a tcp4 or tcp6 socket
            me.connect( cfg.port, cfg.host );
        }
        str = ( cfg.fd ) ? cfg.fd : ( cfg.host + ':' + cfg.port );
        me.bark( 'attempt', attempts, Date.now(), me.lapse );
        me.bark( 'info', 'connection status is ' + me.readyState + ' to ' + str );
    };

    // write to socket
    cproto.send = function ( msg, enc, cback ) {
        var me = this,
            //parent = me.constructor.super_,
            // call net.Socket.write
            // ok = parent.prototype.write.apply( me, arguments );
            ok = me.write.apply( me, arguments );
        if ( ! ok ) {
            /* 
             * commands are not written to socket, but buffered in memory
             * ( the socket connection is slow or not fully established )
             * returns -1 if bufferSize is undefined
             */
            me.bark( 'slowdown', me.readyState, me.bufferSize || 0 );
        }
        return ok;
    };

    // voluntarily close the socket connection
    cproto.bye = function ( data, encoding ) {
        var me = this,
            parent = me.constructor.super_;
        me.lost = true;
        parent.prototype.end.apply( me, arguments );
    };

    // event emitting and console logging
    cproto.bark = function () {
        var me = this,
            parent = me.constructor.super_,
            args = null;

        parent.prototype.emit.apply( me, arguments )
        if ( me.options.debug ) {
            log.apply( me, arguments );
        }
    };

    return Cocker;
} )();
