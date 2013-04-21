define(['spec_helpers/adapter'], function(adapter){
    var fulfilled = adapter.fulfilled;
    var rejected = adapter.rejected;
    var pending = adapter.pending;
    var exports = {};

    exports.testFulfilled = function (value, test) {
        it("already-fulfilled", function (done) {
            test(fulfilled(value), done);
        });

        it("immediately-fulfilled", function (done) {
            var tuple = pending();
            test(tuple.promise, done);
            tuple.fulfill(value);
        });

        it("eventually-fulfilled", function (done) {
            var tuple = pending();
            test(tuple.promise, done);
            setTimeout(function () {
                tuple.fulfill(value);
            }, 50);
        });
    };

    exports.testRejected = function (reason, test) {
        it("already-rejected", function (done) {
            test(rejected(reason), done);
        });

        it("immediately-rejected", function (done) {
            var tuple = pending();
            test(tuple.promise, done);
            tuple.reject(reason);
        });

        it("eventually-rejected", function (done) {
            var tuple = pending();
            test(tuple.promise, done);
            setTimeout(function () {
                tuple.reject(reason);
            }, 50);
        });
    };

    return exports;
});