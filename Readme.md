### Cocker

[![NPM VERSION](http://img.shields.io/npm/v/cocker.svg?style=flat)](https://www.npmjs.org/package/cocker)
[![CODACY BADGE](https://img.shields.io/codacy/b18ed7d95b0a4707a0ff7b88b30d3def.svg?style=flat)](https://www.codacy.com/public/44gatti/cocker)
[![CODECLIMATE-TEST-COVERAGE](https://img.shields.io/codeclimate/c/rootslab/cocker.svg?style=flat)](https://codeclimate.com/github/rootslab/cocker)
[![LICENSE](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/rootslab/cocker#mit-license)

![NODE VERSION](https://img.shields.io/node/v/cocker.svg)
[![TRAVIS CI BUILD](http://img.shields.io/travis/rootslab/cocker.svg?style=flat)](http://travis-ci.org/rootslab/cocker)
[![BUILD STATUS](http://img.shields.io/david/rootslab/cocker.svg?style=flat)](https://david-dm.org/rootslab/cocker)
[![DEVDEPENDENCY STATUS](http://img.shields.io/david/dev/rootslab/cocker.svg?style=flat)](https://david-dm.org/rootslab/cocker#info=devDependencies)

[![NPM MONTHLY](http://img.shields.io/npm/dm/cocker.svg?style=flat)](http://npm-stat.com/charts.html?package=cocker)
[![NPM YEARLY](https://img.shields.io/npm/dy/cocker.svg)](http://npm-stat.com/charts.html?package=cocker)
[![NPM TOTAL](https://img.shields.io/npm/dt/cocker.svg)](http://npm-stat.com/charts.html?package=cocker)

[![NPM GRAPH](https://nodei.co/npm/cocker.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/cocker/)

__Cocker__, a socket module to __aggressively__ handle connection retries.

> NOTE: It directly inherits from __net.Socket__. 

### Table of Contents

- __[Install](#install)__
- __[Run Tests](#run-tests)__
- __[Constructor](#constructor)__
- __[Options](#options)__
- __[Properties](#properties)__
- __[Methods](#methods)__
    - __[die](#cockerdie)__
    - __[hunt](#cockerhunt)__
    - __[prey](#cockerprey)__
    - __[run](#cockerrun)__
    - __[bye](#cockerbye)__    
- __[Events](#events)__
- __[Examples](#examples)__
- __[MIT License](#mit-license)__

------------------------------------------------------------------------------

### Install

```bash
$ npm install cocker [-g]
```

> __require__:

```javascript
const Cocker  = require( 'cocker' );
```

### Run Tests

```bash
$ cd cocker/
$ npm test
```

### Constructor

> Arguments between [ ] are optional.

```javascript
Cocker( [ Object options ] )
```
> or
```javascript
new Cocker( [ Object options ] )
```

#### Options

> It accepts a configuration hash like:

```javascript
{
 , path : undefined
 , address : Object
 , connection : Object
 , reconnection : Object
}
```

###### option.address
```javascript
{
    host : '127.0.0.1'
    , port : 0
    , family : null
 }
```

###### option.connection
```javascript
 {
    encoding : null
    , keepAlive : true
    , timeout : 0
    , noDelay : true
    , allowHalfOpen : false
 }
```

###### option.reconnection
```javascript
 {
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
```

### Properties

> __NOTE__: do not mess up with these properties.

##### a property that holds the current configuration object
```javascript
Cocker.options : Object
```

##### current number of connection attempts
```javascript
Cocker.attempts : Number
```

##### a flag useful to manually disable/enable/check reconnection-loop
```javascript
Cocker.lost : Boolean
```

##### current lapse of millis between connection attempts
```javascript
Cocker.lapse : Number
```

### Methods

> all the methods from net.Socket module are inherited.

|            name          |                    description                    |
|:-------------------------|:--------------------------------------------------|
| __[die](#cockerdie)__    | `end the connection. (_Promise_)`                 |
| __[hunt](#cockerhunt)__  | `connect to socket or attempting to. (_Promise_)` |
| __[prey](#cocker#prey)__ | `connect using a list of hosts. (_Promise_)`      |
| __[bye](#cockerbye)__    | `end the connection.`                             |
| __[run](#cockerrun)__    | `connect to socket or attempting to.`             |

> Arguments between [ ] are optional.

#### Cocker.die
> ##### end the connection (without re-connecting).
```javascript
// Promise will not be resolved until 'lost' event
'die' : function ( [ Buffer | String data, [, String enc ] ] ) : Promise
```

#### Cocker.hunt
> ##### connect to socket or attempting to (k times).
```javascript
/*
 * Promise will not be resolved until 'online', rejected after 'lost' event;
 * it optionally accepts a cocker option object to reconfigure the socket.
 */
'hunt' : function ( [ Object cocker_options ] ) : Promise
```

#### Cocker.prey
> ##### try to connect until success, using a list of optional hosts/config.
```javascript
/*
 * it recursively scan a list, using #hunt Promises. The #prey Promise will 
 * not be resolved until a connection will be made, definitively rejected when
 * no hosts had accepted one. 
 * Every host in the list should be an object like Cocker.options.address
 */
'prey' : function ( Array hosts ) : Promise
```

#### Cocker.bye
> ##### end the connection (without re-connecting).
```javascript
'bye' : function ( [ Buffer | String data, [, String enc ] ] ) : undefined
```

#### Cocker.run
> ##### connect to socket or attempting to (k times).
```javascript
// it optionally accepts a cocker option object to reconfigure the socket.
'run' : function ( [ Object cocker_options ] ) : undefined
```

### Events

> all the events from net.Socket module are inherited.

##### !online: connection was established.
```javascript
// when: soon after socket 'connect' event
'online' : function ( Object address  )
```

##### !offline: connection is down.
```javascript
// when: on the first 'close' event for the current socket
'offline' : function ( Object address  )
```

##### !attempt: current connection attempt.
```javascript
// when: on every connection
'attempt' : function ( Number t, Object address, Number lapse )
```


##### !lost: no other attempts will be made, connection is definitively lost.
```javascript
// when: after k connection attempts, socket will be definitively closed.
'lost' : function ( Number t, Object address, Number lapse )
```

### Examples

> See __[examples](example/)__.


### MIT License

> Copyright (c) 2013-present &lt; Guglielmo Ferri : 44gatti@gmail.com &gt;

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
