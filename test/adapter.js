var Promise = require('../src/Shvua.js').Promise;

exports.fulfilled = function(value) {
    var p = new Promise();
    p.fulfill(value);
    return p;
};

exports.rejected = function(value) {
    var p = new Promise();
    p.reject(value);
    return p;
};

exports.pending = function() {
    var p = new Promise();
    return {
        promise : p,
        fulfill : p.fulfill.bind(p),
        reject  : p.reject.bind(p)
    }
};
