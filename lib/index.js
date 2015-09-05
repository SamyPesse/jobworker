var _ = require("lodash");

var Client = require('./client');
var Server = require('./server');

// Transports
var webWorker = require('./webworker');

module.exports = {
    Client: Client,
    Server: Server,
    WebWorkerServer: _.compose(Server, webWorker.Server),
    WebWorkerClient: _.compose(Client, webWorker.Client)
};
