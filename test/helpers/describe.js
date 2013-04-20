(function(){
    var old = window.describe;

    window.describe = function describe(modules, name, cb){
        define(modules, function(){
            var args = [].slice.call(arguments);
            old(name, function(){
                cb.apply(this, args);
            });
        });
    };
}());
