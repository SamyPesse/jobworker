var Q = require('q');
var should = require('should');
require('should-promised');

var jw = require('../');
var memoryWk = require('../lib/memory');

var server = jw.Server(memoryWk.Server());
var client = jw.Client(memoryWk.Client(), {
    waitInterval: 100,
    maxWaitTillReady: 3
});

server.register({
    testSync: function(a, b) {
        return (a + b + 4);
    },
    testAsync: function(a, b) {
        return Q()
        .timeout(1000)
        .then(function() {
            return (a + b + 2);
        });
    },
    testError: function() {
        throw new Error("test");
    },
    testErrorString: function() {
        throw "test 2";
    }
});

it('should fail with timeout if server is not started', function() {
    return client.callMethod('testSync', 1, 2)
    .should.be.rejectedWith('Max retry to connect to worker failed');
});

it('should correctly start client and server', function() {
    server.start();
    client.start();
});

it('should correctly call a sync method', function() {
    return client.callMethod('testSync', 1, 2)
    .should.finally.be.exactly(7);
});

it('should correctly call an async method', function() {
    return client.callMethod('testAsync', 1, 2)
    .should.finally.be.exactly(5);
});

it('should correctly return an error', function() {
    return client.callMethod('testError')
    .should.be.rejectedWith('test');
});

it('should correctly return an error (2)', function() {
    return client.callMethod('testErrorString')
    .should.be.rejectedWith('test 2');
});
