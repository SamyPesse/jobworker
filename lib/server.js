var _ = require('lodash');
var Q = require('q');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Server(worker) {
    if (!(this instanceof Server)) return new Server(worker);

    this.worker = worker;
    this.methods = {};

    _.bindAll(this, _.functionsIn(this));

    this.on('ping', this.onPing);
    this.on('call', this.onCall);
}
util.inherits(Server, EventEmitter);

// When pinged, sent ready
Server.prototype.onPing = function(sender, msg) {
    this.send(sender, 'pong');
};

// When receive call, execute it, then return
Server.prototype.onCall = function(sender, msg) {
    var that = this;
    var method = msg.method;
    var args = msg.arguments || [];
    var taskId = msg.id;

    if (!method || !taskId) return;

    Q()
    .then(function() {
        if (!that.methods[method]) throw new Error("Method doesn't exist: "+method);

        return that.methods[method].apply(that, args);
    })
    .then(function(r) {
        return {
            resolved: r
        };
    }, function(err) {
        if (_.isString(err)) err = new Error(err);

        return Q({
            rejected: {
                value: err.toString(),
                message: err.message,
                stack: err.stack
            }
        });
    })
    .then(function(r) {
        r.id = taskId;

        that.send(sender, "result:"+r.id, r);
    });
};

// Send a message to a client
Server.prototype.send = function(client, msg, data) {
    this.worker.send(client, {
        message: msg,
        data: data || {}
    });
};

// Register methods
Server.prototype.register = function(method, handler) {
    var that = this;

    if (_.isObject(method)) {
        _.each(_.functions(method), function(name) {
            that.register(name, method[name]);
        });
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

// When server received a message
Server.prototype.onMessage = function(sender, msg) {
    if (!msg.message) return;
    this.emit(msg.message, sender, msg.data);
};

// Start the worker
Server.prototype.start = function() {
    this.worker.start();
    this.worker.onMessage(this.onMessage);
};


module.exports = Server;
