/*
 * Cocker, a socket module with reconnection logic.
 * Copyright(c) 2011 Guglielmo Ferri <44gatti@gmail.com>
 * MIT Licensed
 */

exports.version = require( '../package' ).version;
exports.Cocker = ( function () {
    'use strict';
    var log = console.log,
        net = require( 'net'),
        path = require( 'path' ),
        util = require( 'util' ),
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
                 * true for disabling the Nagle algorithm 
                 * ( no TCP data buffering for socket.write )
                 */
                noDelay : false,
                // fd should be undefined, not null!!
                fd : undefined,
                 // 'tcp4', 'tcp6', or 'unix'
                type : null,
                allowHalfOpen : false,
                // Cocker custom options
                attempts : 3,
                retryInterval : 1250,
                retryFactor : ( Math.sqrt( 5 ) + 1 ) / 2
            }, opt || {} );

            // count trials
            me.attempts = 0;
            me.lost = false;

            // call the super constructor with socket options
            me.constructor.super_.call( me, {
                fd : cfg.fd,
                type : cfg.type,
                allowHalfOpen : cfg.allowHalfOpen
            } );

            // set encoding, if null it defaults to 'utf8'
            me.setEncoding( cfg.encoding );
            me.setNoDelay( cfg.noDelay );
            me.setTimeout( cfg.timeout );
            me.setKeepAlive.apply( me, cfg.keepAlive ? [ true, cfg.keepAlive ] : [ false ] );
        },
        cproto;

    util.inherits( Cocker, net.Socket );

    cproto = Cocker.prototype;


    return Cocker;
} )();
