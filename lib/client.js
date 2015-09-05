var _ = require('lodash');
var Q = require('q');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Client(worker, opts) {
    if (!(this instanceof Client)) return new Client(worker);

    this.options = _.defaults(opts || {}, {
        waitInterval: 500,
        maxWaitTillReady: 10
    });
    this.worker = worker;
    this.isReady = false;

    _.bindAll(this);
}
util.inherits(Client, EventEmitter);

// Send a message to the server
Client.prototype.send = function(msg, data) {
    this.worker.send({
        message: msg,
        data: data || {}
    });
};

// Call a method
Client.prototype.callMethod = function(method) {
    var that = this;
    var args = Array.prototype.slice.call(arguments, 1);

    return this.waitTillReady()
    .then(function() {
        var d = Q.defer();

        var task = {
            id: _.uniqueId("task"),
            method: method,
            arguments: args
        };

        var resultEvent = 'result:'+task.id;
        var resultCallback = function(event, data) {
            if (data.rejected) {
                var err = new Error(data.rejected.message);
                err.stack = data.rejected.stack;

                d.reject(err);
            } else {
                d.resolve(data.resolved);
            }
        };

        // Handle result sent back
        that.once(resultEvent, resultCallback);

        // Send call to server
        that.send('call', task);

        return d.promise
        .fin(function() {
            that.removeAllListeners(resultEvent)
        });
    });
};

// When server received a message
Client.prototype.onMessage = function(msg) {
    if (!msg.message) return;
    this.emit(msg.message, msg.data);
};

// Wait till the server is ready
Client.prototype.waitTillReady = function(i) {
    if (this.isReady) return Q();
    i = i || 0;

    var that = this;
    var d = Q.defer();

    this.once('pong', function() {
        that.isReady = true;
        d.resolve();
    });

    this.send('ping');

    return d.promise
    .timeout(this.options.waitInterval)
    .fail(function() {
        if (i >= that.options.maxWaitTillReady) {
            throw "Max retry to connect to worker failed";
        }

        return Q(that.waitTillReady(i + 1));
    });
};

// Start the worker
Client.prototype.start = function() {
    this.worker.start();
    this.worker.onMessage(this.onMessage);

    return this.waitTillReady();
};


module.exports = Client;
