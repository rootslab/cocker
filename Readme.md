###Cocker
[![build status](https://travis-ci.org/rootslab/cocker.png?branch=master)](https://travis-ci.org/rootslab/cocker)
> A socket module with re-connection logic.

###Install

```bash
$ npm install cocker [-g]
```

> __require__:

```javascript
var Cocker  = require( 'cocker' );
```


###Run Tests - WIP

```bash
$ cd cocker/
$ npm test
```

###Constructor

> Create an instance. 

```javascript
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
        // interval between attempts = retryInterval * Math.pow( attempt, retryFactor )
        retryFactor : ( Math.sqrt( 5 ) + 1 ) / 2
    };
```

###Properties

> All the properties from net.Socket module are inherited.

> also :

```javascript
// a property that holds the initial config object:
Cocker.options : Object

// current number of connection attempts
Cocker.attempts : Number

// a flag, also useful to manually disable/re-enable/check reconnection-loop
Cocker.lost : Boolean
```

###Methods

> All the methods from net.Socket module are inherited.

> Cocker methods:

```javascript
// connect optionally with a config object, like for net.Socket constructor.
Cocker#run( [ Object opt ] ) : null

// write to socket, encoding defaults to 'utf8'
Cocker#send( Buffer data || String msg [ , String enc [, Function cback ] ] ) : Boolean

// end the connection
Cocker#bye() : null

// emit an event, if debug was on , it logs event to console
Cocker#bark( String evt, arg1, arg2, .., argN ) : null
```

###Events

> All the events from net.Socket module are inherited.

> Cocker events :

```javascript

// connection is established ( on 'connect' event )
'online' : function ( Object address, Number timestamp ) {}

/*
 * connection is down ( on 'close' event )
 * now it will try to reconnect opt.attempts times.
 */
'offline' : function ( Number timestamp ) {}

// connection is definitively lost ( after opt.attempts times )
'lost' : function ( Number timestamp ) {}

/*
 * commands are not written to socket, but buffered in memory
 * ( the socket connection is slow or not fully established )
 * returns -1 if bufferSize is undefined.
 * 'drain' will be emitted when the buffer is again free.
 */
'slowdown' : function ( String readyState, Number bufferSize ) {}

// informational event for logging
'info' : function ( String msg ) {}

// warning event for logging
'warning' : function ( String  msg ) {}

// signal socket timeout
'timeout' : function ( Number timestamp ) {}
```

> other events from net.Socket:

```javascript


'connect' : function () {}

'close' : function ( Boolean hadError ) {}

'data' : function ( Buffer data ) {}

'drain' : function ( Boolean hadError ) {}

'error' : function ( Error err ) {}

```

### MIT License

> Copyright (c) 2012 &lt; Guglielmo Ferri : 44gatti@gmail.com &gt;

> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:

> __The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.__

> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

