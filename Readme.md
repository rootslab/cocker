###Cocker
[![build status](https://travis-ci.org/rootslab/cocker.png?branch=master)](https://travis-ci.org/rootslab/cocker)
> A socket module with re-connection logic.

###Install
```bash
$ npm install cocker [-g]
```
###Run Tests

```javascript
$cd train/
$npm test
```

###Constructor

> Create an instance. 

```javascript
var Cocker  = require( 'cocker' );
Cocker( [ Object obj ] )
// or
new Cocker( [ Object obj ] )
```

####Options

> Cocker supports all net.Socket options in a unique configuration object:

```javascript
    // default options are listed
    var options = {
        port : 6379,
        host : 'localhost',
        // 'ascii', 'utf8', 'utf16le' ('ucs2'), 'ascii', or 'hex'.
        encoding : null,
        // false, or initialDelay in ms
        keepAlive : false,
        // millis to emit timeout event
        timeout : 2000,
        /*
         * noDelay, it defaults to false.
         * true for disabling the Nagle algorithm 
         * ( no TCP data buffering for socket.write )
         */
        noDelay : false,
        // unix socket domain file descriptor - path
        fd : undefined,
        // 'tcp4', 'tcp6', or 'unix'
        type : null,
        /*
         * By setting allowHalfOpen = true, the socket will not
         * automatically end()s its side, allowing the user to write
         * arbitrary amounts of data, with the caveat that the user is
         * required to end() his side now.
         */
        allowHalfOpen : false,
        
        // Cocker reconnection options
        // logging to console
        debug : false
        // try 3 times before quitting
        attempts : 3,
        // millis, default to 1 sec
        retryInterval : 1000,
        // interval between retries is calculated also with this value
        retryFactor : goldenRatio,
    };
```

###Properties

> All the properties from net.Socket module are inherited.

> Only a property to hold initial config option is added:

```javascript
Cocker.options = {
    ...
}
```

###Methods

> All the methods from net.Socket module are inherited.

> Cocker methods:

```javascript
// connect optionally with a config object, like for net.Socket constructor.
Cocker#run( [ Object opt ] ) : null

// write to socket
Cocker#send( Buffer data || String msg ) : Boolean

// end the connection
Cocker#bye() : null

// emit an event, if debug was on , it logs event to console
Cocker#lemit( String event, arg1, arg2, .., argN ) : null
```

###Events

```javascript

// connection is established ( on 'connect' event )
'online' : function ( Object address, Number timestamp ) {}

/*
 * connection is down ( on 'close' event )
 * now it will try to reconnect opt.attempts times.
 */
'offline' : function ( Number timestamp ) {}

// connection is definitively lost ( after opt.attempts times )
'lost' : function ( timestamp ) {}

/*
 * commands are not written to socket, but buffered in memory
 * ( the socket connection is slow or not fully established )
 * returns -1 if bufferSize is undefined.
 */
'slowdown' : function ( readyState, bufferSize ) {}

// informational event for logging
'info' : function ( String msg ) {}

// warning event for logging
'warning' : function ( String  msg ) {}

// error
'error' : function ( Error err ) {}

// signal socket timeout
'timeout' : function ( timestamp ) {}

// data received
'data' : function ( data ) {}

// other events for net.Socket

'connect' : function () {}

'close' : function ( hadError ) {}
```
