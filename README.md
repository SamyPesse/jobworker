JobWorker
=============================

[![NPM version](https://badge.fury.io/js/jobworker.svg)](http://badge.fury.io/js/jobworker)
[![Build Status](https://travis-ci.org/SamyPesse/jobworker.png?branch=master)](https://travis-ci.org/SamyPesse/jobworker)


JobWorker is an utility to create background job workers. This module provides a transport to work with `WebWorker`, but can also be transport agnostic.

## Installation

```
$ npm install jobworker
```

### Usage

Create a web-worker "myworker.js" using:

```js
var jw = require("jobworker");

var server = new jw.WebWorkerServer();

// Register some methods
server.register({
    // Task can be sync
    hello: function() {
        return "World";
    },

    // Or async:
    testAsync: function() {
        return doSomethingSync()
        .then(function() {
            // it should return a promise
        });
    }
});

// Run the worker
server.start();
```

And in your application, access the web-worker using:

```js
var jw = require("jobworker");

var worker = new jw.WebWorkerServer("myworker.js");


// Call a method
worker.callMethod("hello")
.then(function(msg) {

});

// Or create a binded nethod:
var testAsync = worker.method("testAsync");
```

### Custom Transport

[Events](https://github.com/SamyPesse/jobworker/tree/master/lib/events) and [WebWorker](https://github.com/SamyPesse/jobworker/tree/master/lib/webworker) are good examples on how to write a custom transport.

