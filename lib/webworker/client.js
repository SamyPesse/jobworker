var _ = require('lodash');
var Q = require('q');


function Client(script) {
    if (!(this instanceof Client)) return new Client(script);

    this.worker = _.isString(script)? (new Worker(script)) : script;
    this.callbacks = [];
}

// Send a message to the server
Client.prototype.send = function(message) {
    this.worker.postMessage(message);
};

// Bind a function to received message
Client.prototype.onMessage = function(callback) {
    this.callbacks.push(callback);
};

// Start the worker client
Client.prototype.start = function() {
    var that = this;

    this.worker.addEventListener('message', function(e) {
        var msg = e.data;

        _.each(that.callbacks, function(callback) {
            callback(msg);
        });
    }, false);
};

module.exports = Client;