define(['Promise'], function(Promise){
    return {
        reject : function(value) {
            return new Promise(function(f,r){r(value);});
        },
        fulfill : function(value) {
            return new Promise(function(f) {f(value);});
        }
    };
});
