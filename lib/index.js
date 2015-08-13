var _ = require("lodash");

var JobWorker = require('./jobworker');

// Transports
var webWorker = require('./webworker');

module.exports = JobWorker;
module.exports.WebWorker = _.compose(JobWorker, webWorker);
