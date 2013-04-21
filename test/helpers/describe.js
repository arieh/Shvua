(function(){
    var old_desc = window.describe,
        old_it = window.it;

    window.describe = function describe(modules, name, cb){
        if (!cb && typeof modules == 'string') {
            return describe(modules, name);
        }

        define(modules, function(){
            var args = [].slice.call(arguments);
            old_desc(name, function(){
                cb.apply(this, args);
            });
        });
    };

    window.it = function it(name, cb, timeout) {
        if (!cb.length) return old_it(name, cb);

        old_it(name, function(){
            var done = 0;

            cb(done);

            waitsFor(function(){return done;}, "waiting for async action to finish", timeout || 3 * 1000);
        });
    };
}());
