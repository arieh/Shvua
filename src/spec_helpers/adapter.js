define(['../Promise'], function(Promise){
    return {
        rejected : function(value) {
            return new Promise(function(f,r){r(value);});
        },
        fulfilled : function(value) {
            return new Promise(function(f) {f(value);});
        },
        pending : function(){
            var promise = new Promise();

            return {
                promise : promise,
                fulfill : function(value) {return promise.fulfill(value);},
                reject  : function(reason) {return promise.reject(reason);}
            };
        }
    };
});
