var _ = require("lodash");
var Q = require("q");
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function JobWorker(worker) {
    if (!(this instanceof JobWorker)) return (new JobWorker(worker));

    this.worker = worker;
    this.methods = {};
};
util.inherits(JobWorker, EventEmitter);

// Call a metod from the worker
JobWorker.prototype.callMethod = function(method) {
    var that = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var d = Q.defer();

    var taskId = _.uniqueId("task");
    var msg = {
        id: taskId,
        method: method,
        arguments: args
    };

    this.worker.once("result:"+taskId, function(event, data) {
        if (data.rejected) {
            d.reject(new Error(data.rejected));
        } else {
            d.resolve(data.resolved);
        }
    });

    this.worker.send('call', msg)

    return d.promise;
};

// Return a method as a function ca be called
JobWorker.prototype.method = function(method) {
    return _.partial(_.bind(this.callMethod, this), method);
};

// Register a method
JobWorker.prototype.register = function(method, handler) {
    var that = this;

    if (_.isObject(method)) {
        _.each(_.methods(method), function(name) {
            this.register(name, method[name]);
        }, this);
        return;
    }

    this.methods[method] = function() {
        var args = Array.prototype.slice.apply(arguments);

        return Q()
        .then(function() {
            return _.partial.apply(_, [handler].concat(args))();
        });
    };
};

// Run in the worker
JobWorker.prototype.run = function() {
    var that = this;

    // Handle message from worker
    this.worker.on('call', function(event, data) {
        var method = data.method;
        var taskId = data.id;
        var args = data.arguments || [];

        if (!method || !taskId) return;

        Q()
        .then(function() {
            if (!that.methods[method]) throw "Method doesn't exist: "+method;

            return that.methods[method].apply(that, args);
        })
        .then(function(r) {
            return {
                resolved: r
            };
        }, function(err) {
            return Q({
                rejected: err.toString()
            });
        })
        .then(function(r) {
            r.id = taskId;

            event.sender.send("result:"+r.id, r);
        })
    });

    this.worker.start();
};

module.exports = JobWorker;
