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

```javascript
```

###Properties

```javascript
```

###Methods

```javascript
// connect optionally with a config object, like for net.Socket constructor.
Cocker#run( [ Object opt ] ) : null

// write to socket
Cocker#send( Buffer data || String msg ) : Boolean

// end the connection
Cocker.bye() : null

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
