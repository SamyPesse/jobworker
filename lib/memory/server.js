var _ = require('lodash');
var Q = require('q');

var events = require('./events');

function Server(worker) {
    if (!(this instanceof Server)) return new Server(worker);
}

// Send a message to a specific client
Server.prototype.send = function(client, message) {
    events.emit('server-sent', {
        client: client,
        message: message
    });
};

// Bind a function to received message
Server.prototype.onMessage = function(callback) {
    events.on('client-sent', function(msg) {
        callback(msg.client, msg.message);
    });
};

// Start the worker server
Server.prototype.start = function() {

};

module.exports = Server;