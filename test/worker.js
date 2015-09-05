var Q = require('q');
var assert = require('assert');

var jw = require('../');
var memoryWk = require('../lib/memory');

var server = jw.Server(memoryWk.Server());
var client = jw.Client(memoryWk.Client());

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
    }
});



describe('JobWorker', function() {

    it('should correctly call a sync method', function() {
        return client.callMethod('testSync', 1, 2)
        .then(function(r) {
            assert.equal(r, 7);
        });
    });

});
