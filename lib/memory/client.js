var _ = require('lodash');
var Q = require('q');

var events = require('./events');

function Client() {
    if (!(this instanceof Client)) return new Client();

    this.id = _.uniqueId('client');
}

// Send a message to the server
Client.prototype.send = function(message) {
    events.emit('client-sent', {
        client: this.id,
        message: message
    });
};

// Bind a function to received message
Client.prototype.onMessage = function(callback) {
    this.on('server-sent', function(msg) {
        callback(msg.message);
    });
};

// Start the worker client
Client.prototype.start = function() {

};

module.exports = Client;