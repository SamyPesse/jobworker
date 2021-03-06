var _ = require('lodash');
var Q = require('q');

function Client(events) {
    if (!(this instanceof Client)) return new Client(events);

    this.events = events;
    this.id = _.uniqueId('client');
}

// Send a message to the server
Client.prototype.send = function(message) {
    this.events.emit('client-sent', {
        client: this.id,
        message: message
    });
};

// Bind a function to received message
Client.prototype.onMessage = function(callback) {
    var that = this;

    this.events.on('server-sent', function(msg) {
        if (msg.client != that.id) return;

        callback(msg.message);
    });
};

// Start the worker client
Client.prototype.start = function() {

};

module.exports = Client;