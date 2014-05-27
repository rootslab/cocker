###Cocker
[![build status](https://travis-ci.org/rootslab/cocker.png?branch=master)](https://travis-ci.org/rootslab/cocker)
[![NPM version](https://badge.fury.io/js/cocker.png)](http://badge.fury.io/js/cocker)

[![NPM](https://nodei.co/npm/cocker.png?downloads=true&stars=true)](https://nodei.co/npm/cocker/)

[![NPM](https://nodei.co/npm-dl/cocker.png)](https://nodei.co/npm/cocker/)



> **__Cocker__**. a socket module to handle reconnection retries.

> For nodeJS versions < __v0.10.x__, check __v0.8.x__ branch.

###Install

```bash
$ npm install cocker [-g]
```

> __require__:

```javascript
var Cocker  = require( 'cocker' );
```

###Run Tests

```bash
$ cd cocker/
$ npm test
```

###Constructor

> Create an instance. Arguments within [ ] are optional.

```javascript
Cocker( [ Object opt ] ) : Cocker
// or
new Cocker( [ Object opt ] ) : Cocker
```

####Options

> Cocker supports all net.Socket options in a unique configuration object:

```javascript
opt = {
 address : {
    port : 0
    , host : 'localhost'
 }
 , path : {
    fd : undefined
    , readable : true
    , writable : true
 }
 , connection : {
    encoding : null
    , keepAlive : true
    , timeout : 0
    , noDelay : true
    , allowHalfOpen : false
 }
 // Cocker custom options
 , reconnection : {
    trials : 3
    , interval : 1000
    , factor : ( Math.sqrt( 5 ) + 1 ) / 2
 }
}
```

###Properties

> Cocker custom properties:

```javascript
// a property that holds the initial config object:
Cocker.options : Object

// current number of connection attempts
Cocker.attempts : Number

// a flag, also useful to manually disable/re-enable/check reconnection-loop
Cocker.lost : Boolean

// the last interval in millis between connection attempts.
Cocker.lapse : Number
```

###Methods

> All the methods from net.Socket module are inherited.

> Arguments within [ ] are optional, '|' indicates multiple type for an argument.

```javascript
// connect optionally with a config object, like for the constructor.
Cocker#run( [ Object options ] ) : undefined

// Use this method to end the connection without re-connecting.
Cocker#bye( [ Buffer data | String message [, String encoding ] ] ) : undefined
```

###Events

> All the events from net.Socket module are inherited.

> Cocker custom events:

```javascript

// Connection was established.
'online' : function ( Object address ) : undefined

// Connection is down ( on first 'close' event ).
'offline' : function ( Object address ) : undefined

// k is the number of current connection attempt
'attempt' : function ( Number k, Object address, Number millis ) : undefined

// connection is definitively lost ( after opt.attempts times )
'lost' : function ( Object address ) : undefined

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
