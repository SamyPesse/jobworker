JobWorker
=============================

> Utility to create a job queue in a webworker

## Installation

```
$ npm install jobworker
```

### Documentation

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

