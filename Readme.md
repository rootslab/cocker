###Cocker

[![NPM VERSION](http://img.shields.io/npm/v/cocker.svg?style=flat)](https://www.npmjs.org/package/cocker)
[![CODACY BADGE](https://img.shields.io/codacy/b18ed7d95b0a4707a0ff7b88b30d3def.svg?style=flat)](https://www.codacy.com/public/44gatti/cocker)
[![CODECLIMATE](http://img.shields.io/codeclimate/github/rootslab/cocker.svg?style=flat)](https://codeclimate.com/github/rootslab/cocker)
[![CODECLIMATE-TEST-COVERAGE](https://img.shields.io/codeclimate/coverage/github/rootslab/cocker.svg?style=flat)](https://codeclimate.com/github/rootslab/cocker)
[![LICENSE](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/rootslab/cocker#mit-license)

[![TRAVIS CI BUILD](http://img.shields.io/travis/rootslab/cocker.svg?style=flat)](http://travis-ci.org/rootslab/cocker)
[![BUILD STATUS](http://img.shields.io/david/rootslab/cocker.svg?style=flat)](https://david-dm.org/rootslab/cocker)
[![DEVDEPENDENCY STATUS](http://img.shields.io/david/dev/rootslab/cocker.svg?style=flat)](https://david-dm.org/rootslab/cocker#info=devDependencies)
[![NPM DOWNLOADS](http://img.shields.io/npm/dm/cocker.svg?style=flat)](http://npm-stat.com/charts.html?package=cocker)

[![NPM GRAPH1](https://nodei.co/npm-dl/cocker.png)](https://nodei.co/npm/cocker/)

[![NPM GRAPH2](https://nodei.co/npm/cocker.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/cocker/)

[![status](https://sourcegraph.com/api/repos/github.com/rootslab/cocker/.badges/status.png)](https://sourcegraph.com/github.com/rootslab/cocker)
[![views](https://sourcegraph.com/api/repos/github.com/rootslab/cocker/.counters/views.png)](https://sourcegraph.com/github.com/rootslab/cocker)
[![views 24h](https://sourcegraph.com/api/repos/github.com/rootslab/cocker/.counters/views-24h.png)](https://sourcegraph.com/github.com/rootslab/cocker)

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

> Create an instance, the argument within [ ] is optional.

```javascript
Cocker( [ Object opt ] ) : Cocker
// or
new Cocker( [ Object opt ] ) : Cocker
```

####Options

> Cocker supports net.Socket options:

```javascript
cocker_opt = {
 address : {
    host : '127.0.0.1'
    , port : 0
    , family : null
 }
 , path : undefined
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
    /*
     * A value to use for calculating the pause between two
     * connection attempts. Default value is the golden ratio.
     * Final value is calculated as:
     * interval * Math.pow( factor, curr.attempts + 1 )
     */
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
// connect to socket, optionally (re-)configuring the connection.
Cocker#run( [ Object cocker_options ] ) : undefined

// Use this method to end the connection without re-connecting.
Cocker#bye( [ Buffer data | String message [, String encoding ] ] ) : undefined
```

###Events

> All the events from net.Socket module are inherited.

> Cocker custom events:

```javascript

/*
 * Connection was established.
 */
'online' : function ( Object address )

/*
 * Connection is down ( on first 'close' event for the socket).
 */
'offline' : function ( Object address )

/*
 * k is the number of current connection attempt.
 */
'attempt' : function ( Number k, Object address, Number millis )

/*
 * Connection is definitively lost ( after opt.reconnection.trials times ).
 */
'lost' : function ( Object address )

```

### MIT License

> Copyright (c) 2015 &lt; Guglielmo Ferri : 44gatti@gmail.com &gt;

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

[![GA](https://ga-beacon.appspot.com/UA-53998692-1/cocker/Readme?pixel)](https://github.com/igrigorik/ga-beacon)