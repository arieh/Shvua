define(['Events'],function(Events){
    var undef, async;

    function extend(obj, parent, methods) {
        var name;

        function F(){};

        F.prototype = parent.prototype || parent;

        obj.prototype = new F();
        obj.prototype.constructor = obj;

        for (name in methods) {
            if (methods.hasOwnProperty(name)) obj.prototype[name] = methods[name];
        }

        return obj;
    }

    async = (function(){
        try {
            if (process && process.nextTick) {
                return function(cb){
                    process.nextTick(cb);
                }
            }
        } catch(e) {
            if (window.setImediate) return window.setImediate;
        }

        return function(cb){
            setTimeout(cb, 0);
        }
    }());

    function Promise(cb){
        var fulfill = this.fulfill.bind(this),
            reject  = this.reject.bind(this);

        Events.Events.call(this);
        this._addEvents = this.addEvents;
        this._fireEvent = this.fireEvent;

        if (!cb) return;

        async(function(){
            cb(fulfill, reject);
        });
    }

    Promise.STATES = {
        PENDING : 0,
        FULFILLED : 1,
        REJECTED : 2
    };

    Promise.prototype = {
        constructor : Promise,
        isFulfilled : false,
        isRejected : false,
        fulfillment_state : Promise.STATES.PENDING,
        fulfillment_value : undef,
        rejection_reason : undef,
        createPromise : function(){
            var cnstr = this.constructor;

            return new cnstr();
        },
        then : function(cb, err) {
            var promise = this.createPromise();

            this._addEvents({
                'fulfill' : function(e) {
                    var value, error;

                    try {
                        value = cb && cb(e.args);
                    } catch(er) {
                        value = er;
                        error = true;
                    }

                    if (error) {
                        promise.reject(error);
                        return;
                    }

                    if (value && value.then){
                        value.then(function(value){
                            promise.fulfill(value);
                        }, function(err) {
                            promise.reject(err);
                        });
                    }else {
                        promise.fulfill(value);
                    }
                },
                'reject' : function(e) {
                    err && err(e.args);
                    promise.reject(e.args);
                }
            });

            return promise;
        },
        fulfill : function(value) {
            var $this = this;

            if (this.fulfillment_state != Promise.STATES.PENDING) {
                throw "Trying to modify state of non-pending Promise";
            }

            if (value instanceof Promise) {
                value._addEvents({
                    'fulfill': function(e){
                        $this.fulfill(e.args);
                    },
                    'reject' : function(e) {
                        $this.reject(e.args);
                    }
                });
            } else {
                this.fulfillment_state = Promise.STATES.FULFILLED;
                this.fulfillment_value = value;
                this.isFulfilled = true;
                this._fireEvent('fulfill:latched', value);
            }

            return this;
        },
        reject : function(reason) {
            var $this = this;

            if (this.fulfillment_state != Promise.STATES.PENDING) {
                throw "Trying to modify state of non-pending Promise";
            }

            this.fulfillment_state = Promise.STATES.REJECTED;
            this.rejection_reason = reason;
            this.isRejected = true;
            this._fireEvent('reject:latched', reason);

            return this;
        }
    };

    Promise.extend = function(obj, methods){
        var wrapped_methods = {};

        function wrap(name){
            return function(){
                var args = [].slice.call(arguments);

                if (this.isFulfilled) {
                    return obj[name].apply(obj, args);
                }

                this.then(function() {
                    obj[name].apply(obj, args);
                });
            }
        }

        function ExtPromise(){
            Promise.apply(this, arguments);
        }

        methods.forEach(function(name){
            wrapped_methods[name] = wrap(name);
        });

        extend(ExtPromise, Promise, wrapped_methods);

        return ExtPromise;
    };

    return Promise;
});
