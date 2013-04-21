describe(['spec_helpers/testThreeCases', 'spec_helpers/assert'],"3.2.4: `then` must return before `onFulfilled` or `onRejected` is called", function (testThreeCases, assert) {
    var testFulfilled = testThreeCases.testFulfilled;
    var testRejected = testThreeCases.testRejected;

    var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

    testFulfilled(dummy, function (promise, done) {
        var thenHasReturned = false;

        promise.then(function onFulfilled() {
            assert(thenHasReturned);
            done();
        });

        thenHasReturned = true;
    });

    testRejected(dummy, function (promise, done) {
        var thenHasReturned = false;

        promise.then(null, function onRejected() {
            assert(thenHasReturned);
            done();
        });

        thenHasReturned = true;
    });
});