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
var JobWorker = require("jobworker");

var worker = new JobWorker();

// Register some methods
worker.register({
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
worker.run();
```

And in your application, access the web-worker using:

```js
var worker = new JobWorker({
    script: "myworker.js"
});


// Call a method
worker.callMethod("hello")
.then(function(msg) {

});

// Or create a binded nethod:
var testAsync = worker.method("testAsync");
```

