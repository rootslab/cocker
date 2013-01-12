/*
 * Cocker, a socket module with reconnection logic.
 * Copyright(c) 2011 Guglielmo Ferri <44gatti@gmail.com>
 * MIT Licensed
 */

exports.version = require( '../package' ).version;
exports.Cocker = ( function () {
    'use strict';
    var log = console.log,
        Cocker = function ( arr ) {
            var me = this;
            if ( ! ( me instanceof Cocker ) ) {
                return new Cocker( arr );
            }
        },
        cproto = Cocker.prototype;

    return Cocker;
} )();
