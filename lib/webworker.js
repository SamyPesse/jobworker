var _ = require("lodash");
var Q = require("q");
var EventEmitter = require('events').EventEmitter;

// Return a worker interface for web-worker
module.exports = function(script) {
    var worker, workerLoading, events = new EventEmitter();

    // Normalize an event from a web-worker
    var _emitMessage = function(sender, e) {
        var data = e.data;
        if (!data.message) return;

        var event = {
            sender: sender
        };

        events.emit(data.message, event, data.data);
    };

    // Normalize a postMessage to a web-worker
    var _postMessage = function(post, msg, data) {
        post({
            message: msg,
            data: data
        });
    };

    // Send a message to the worker
    var send = function(msg, data) {
        return getRemoteWorker()
        .then(function(wk) {
            _postMessage(_.bind(wk.postMessage, wk), msg, data);
        });
    };

    var getRemoteWorker = function() {
        var that = this;

        if (worker) return Q(worker);
        if (workerLoading) return workerLoading;

        var d = Q.defer();
        workerLoading = d.promise;

        worker = _.isString(script)? (new Worker(script)) : script;
        worker.postMessage({
            message: "init"
        });
        worker.addEventListener('message', function(e) {
            if (e.data.message == "ready") {
                d.resolve(that.worker);
            } else {
                _emitMessage({
                    send: send
                }, e);
            }
        }, false);

        return workerLoading;
    };

    return {
        // Start the server in the web-worker
        start: function() {
            var _send = _.partial(_postMessage, postMessage);
            var _receive = _.partial(_emitMessage, {
                send: _send
            });

            // Listen and normalize message
            addEventListener('message', _receive, false);

            // Signal that the worker is ready
            _send("ready");
        },

        // Send a message
        send: send,

        // Listen to message
        on: events.on.bind(events),
        once: events.once.bind(events)
    };
};
