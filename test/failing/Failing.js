describe(
['spec_helpers/adapter','spec_helpers/testThreeCases', 'spec_helpers/assert'],
"3.2.6: `then` must return a promise: `promise2 = promise1.then(onFulfilled, onRejected)`",
function (adapter, testThreeCases, assert) {

    var testFulfilled = testThreeCases.testFulfilled;
    var testRejected = testThreeCases.testRejected;

    var fulfilled = adapter.fulfilled;
    var rejected = adapter.rejected;
    var pending = adapter.pending;

    var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
    var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality
    var other = { other: "other" }; // a value we don't want to be strict equal to

    describe("`promise1` is rejected, and `returnedPromise` is:", function () {
        testRejected(sentinel, function (returnedPromise, done) {
            var promise1 = rejected(dummy);
            var promise2 = promise1.then(null, function onRejected() {
                return returnedPromise;
            });

            promise2.then(null, function onPromise2Fulfilled(value) {
                assert.strictEqual(value, sentinel);
                done();
            });
        });

        it("a pseudo-promise", function (done) {
            var promise1 = rejected(dummy);
            var promise2 = promise1.then(null, function onRejected() {
                return {
                    then: function (f,r) { r(sentinel); }
                };
            });

            promise2.then(null, function onPromise2Rejected(value) {
                assert.strictEqual(value, sentinel);
                done();
            });
        });
    });

});