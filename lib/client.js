var _ = require('lodash');
var Q = require('q');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Client(worker, opts) {
    if (!(this instanceof Client)) return new Client(worker, opts);

    this.options = _.defaults(opts || {}, {
        // Interval between ping tries
        waitInterval: 500,

        // Max number of pings
        maxWaitTillReady: 10,

        // Timeout when calling a method
        timeout: 1*60*1000
    });
    this.worker = worker;
    this.isReady = false;
    this.isStarted = false;

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

    return this.start()
    .then(function() {
        var d = Q.defer();

        var task = {
            id: _.uniqueId("task"),
            method: method,
            arguments: args
        };

        var resultEvent = 'result:'+task.id;
        var resultCallback = function(data) {
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

// Return a function binded for a method
Client.prototype.method = function(method) {
    return _.partial(_.bind(this.callMethod, this), method);
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

    var onPong = function() {
        that.isReady = true;
        d.resolve();
    };

    this.once('pong', onPong);

    this.send('ping');

    return d.promise
    .timeout(this.options.waitInterval)
    .fail(function() {
        that.removeListener('pong', onPong);

        if (i >= that.options.maxWaitTillReady) {
            throw new Error("Failed to connect to worker");
        }

        return Q(that.waitTillReady(i + 1));
    });
};

// Start the worker
Client.prototype.start = function() {
    if (!this.isStarted) {
        this.worker.start();
        this.worker.onMessage(this.onMessage);
        this.isStarted = true;
    }

    return this.waitTillReady();
};


module.exports = Client;
