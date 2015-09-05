var _ = require('lodash');
var Q = require('q');

function Server(events) {
    if (!(this instanceof Server)) return new Server(events);
    this.events = events;
}

// Send a message to a specific client
Server.prototype.send = function(client, message) {
    this.events.emit('server-sent', {
        client: client,
        message: message
    });
};

// Bind a function to received message
Server.prototype.onMessage = function(callback) {
    this.events.on('client-sent', function(msg) {
        callback(msg.client, msg.message);
    });
};

// Start the worker server
Server.prototype.start = function() {

};

module.exports = Server;