barnowl-rfcontrols
==================

Collect ambient RAIN RFID data from RF Controls readers.


Installation
------------

    npm install barnowl-rfcontrols


Quick Start
-----------

Clone this repository, install package dependencies with `npm install`, and then from the root folder run at any time:

    npm start

This will run the TestListener to create simulated RF Controls data, which will be printed to the console and forwarded via UDP to a local [Pareto Anywhere](https://github.com/reelyactive/pareto-anywhere) instance.


Hello barnowl-rfcontrols!
-------------------------

```javascript
const BarnowlRfControls = require('barnowl-rfcontrols');

let barnowl = new BarnowlRfControls();

barnowl.addListener(BarnowlRfControls.TestListener);

barnowl.on('raddec', function(raddec) {
  console.log(raddec);
});
```

As output you should see a stream of [raddec](https://github.com/reelyactive/raddec/) objects similar to the following:

```javascript
{
  transmitterId: '1ab00000000000000000a003',
  transmitterIdType: 4,
  receiverId: 'b797d495c7c94558a77b00a8059fa0b5',
  receiverIdType: 6,
  rssi: -80,
  numberOfDecodings: 1,
  numberOfReceivers: 1,
  timestamp: 1658516050829,
  position: [ 0, 0, 0 ]
}
```


Supported Listener Interfaces
-----------------------------

The following listener interfaces are supported.

### Websocket

```javascript
let options = {
    url: "ws://localhost:61613/websockets/messaging",
    username: "admin",
    password: "admin",
    regionIds: [],
    isDebug: false
};
barnowl.addListener(BarnowlRfControls.WsListener, options);
```

### Test

Provides simulated tagBlinkLite messages for testing purposes.

```javascript
barnowl.addListener(BarnowlRfControls.TestListener, {});
```


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.

[![Known Vulnerabilities](https://snyk.io/test/github/reelyactive/barnowl-rfcontrols/badge.svg)](https://snyk.io/test/github/reelyactive/barnowl-rfcontrols)


License
-------

MIT License

Copyright (c) 2022 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

