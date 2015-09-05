var _ = require('lodash');
var Q = require('q');

function Server(worker) {
    if (!(this instanceof Server)) return new Server(worker);

    this.worker = worker || self;
    this.callbacks = [];
}

// Send a message to a specific client
Server.prototype.send = function(client, message) {
    this.worker.postMessage(message);
};

// Bind a function to received message
Server.prototype.onMessage = function(callback) {
    this.callbacks.push(callback);
};

// Start the worker server
Server.prototype.start = function() {
    var that = this;

    this.worker.addEventListener('message', function(e) {
        _.each(that.callbacks, function(callback) {
            callback(e.sender, e.data);
        });
    }, false);
};

module.exports = Server;