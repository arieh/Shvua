(function (root, factory) {
    if (typeof exports === 'object') {
        var Events = require('eventsjs').Events;
        module.exports = factory(Events);
    } else if (typeof define === 'function' && define.amd) {
        define(['Events'],function (Events) {
            return factory(Events.Events);
        });
    } else {
        root.Shvua = factory(root.Events);
    }
}(this, function (Events){
    /**
     * @module Shvua
     */

    var undef, async, Shvua = {};

    function isThenable(obj) {
        return obj && typeof obj.then == 'function';
    }

    function isFunction(fn) {
        return typeof fn == 'function';
    }

    function extend(obj, parent, methods) {
        var name;

        function F(){}

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
            if (window.setImmediate) return window.setImmediate;
        }

        return function(cb){
            setTimeout(cb, 0);
        }
    }());

    /**
     * @class Shvua.Promise
     * @constructor
     * @uses Events
     *
     * @param {fucntion} [cb] a function to use for updating promise state. Parameters passed to callback will be fulfill function and reject function.
     */
    function Promise(cb){
        var fulfill = this.fulfill.bind(this),
            reject  = this.reject.bind(this);

        Events.call(this);

        this._addEvents = function(events) {
            var type;
            for (type in events) if (events.hasOwnProperty(type)){
                Events.addEvent.call(this, type, events[type]);
            }
        };

        this._fireEvent = function (type, args){
            if (this.$events_destroyed) return this;
            if (!this.$latched) this.$latched = {};

            this.$latched[type] = {args : args};
            Events.fireEvent.call(this,type,args);

            return this;
        };

        if (!cb) return;

        async(function(){
            if (isFunction(cb)) {
                cb(fulfill, reject);
            }else if (isThenable(cb)) {
                fulfill(cb);
            }
        });
    }

    Shvua.Promise = Promise;

    /**
     * @event fulfill
     * fires when a promise has been fulfilled
     * @param value the promise's value
     */
    /**
     * @event reject
     * fires when a promise has been rejected
     * @param reason the rejection's reason
     */

    /**
     * @const STATES
     * @static
     * @type ENUM
     */
    Promise.STATES = {
        PENDING : 0,
        FULFILLED : 1,
        REJECTED : 2
    };

    Promise.prototype = {
        constructor : Promise,

        /**
         * @property $fulfillment_state
         * @type Promise.STATES
         */
        $fulfillment_state : Promise.STATES.PENDING,
        /**
         * @property $fulfillment_value
         * value of fulfilled promise
         */
        $fulfillment_value : undef,
        /**
         * @property $rejection_reason
         * reason for rejected promise
         */
        $rejection_reason : undef,
        createPromise : function(){
            var cnstr = this.constructor;

            return new cnstr();
        },

        /**
         * This method allows the user to take action upon promise fulfillment or rejection
         * @method then
         *
         * @param {function} [onFulfill] a callback to call when promise has been fulfilled. Will be passed promise's value.
         *                        for more info look in spec.
         * @param {function} [onReject] a callback to call upon rejection. Will be passed promise's rejection reason.
         * @returns {Shvua.Promise}
         */
        then : function then(onFulfill, onReject) {
            var promise = this.createPromise();

            function checkValue(action, cb, value){
                async(function(){
                    if (isFunction(cb)) {
                        try {
                            value = cb(value);
                        } catch (e) {
                            promise.reject(e);
                            return;
                        }
                    } else if (action == 'reject') {
                        promise.reject(value);
                    }

                    if (isThenable(value)) {
                        value.then(function(v){
                            promise.fulfill(v);
                        }, function(r){
                            promise.reject(r);
                        });

                        return;
                    }

                    promise.fulfill(value);
                });
            }

            this._addEvents({
                'fulfill' : function(e) {
                    checkValue('fulfil', onFulfill, e.args);
                },
                'reject' : function(e) {
                    checkValue('reject', onReject, e.args);
                }
            });

            return promise;
        },

        /**
         * this method can be used to fulfil a Promise outside of it's scope.
         *
         * @param value
         * @chainable
         */
        fulfill : function fulfill(value) {
            var $this = this;

            if (this.$fulfillment_state != Promise.STATES.PENDING) {
                return this;
            }

            if (isThenable(value)) {
                value.then(function(value){
                    $this.fulfill(value);
                }, function(reason) {
                    $this.reject(reason);
                });
            } else {
                this.$fulfillment_state = Promise.STATES.FULFILLED;
                this.$fulfillment_value = value;
                this._fireEvent('fulfill', value);
            }

            return this;
        },
        /**
         * this method can be used to reject a promise outside the scope
         *
         * @param reason
         * @chainable
         */
        reject : function reject(reason) {
            if (this.$fulfillment_state != Promise.STATES.PENDING) {
                return this;
            }

            this.$fulfillment_state = Promise.STATES.REJECTED;
            this.$rejection_reason = reason;
            this._fireEvent('reject', reason);

            return this;
        },

        /**
         * This method will enter the callback into the fulfill stack and will return a Promise for it
         *
         * @method done
         * @public
         * @param {Function} cb
         * @returns {Shvua.Promise}
         */
        done : function done(cb){
            return this.then(cb);
        },

        /**
         * This method will enter the callback into the reject stack and will return a Promise for it
         *
         * @method fail
         * @public
         * @param cb
         * @returns {Shvua.Promise}
         */
        fail : function fail(cb){
            return this.then(null, cb);
        }
    };


    /**
     * This method can be used to create custom promises that would wrap an object's methods
     * @method extend
     * @static
     *
     * @param {mixed} obj target object
     * @param {array} methods a list of method names to wrap
     * @returns {Shvua.ExtPromise} a new extended Promise constructor
     */
    Shvua.extend = function(obj, methods){
        var wrapped_methods = {};

        function wrap(name){
            return function(){
                var args = [].slice.call(arguments);

                return this.then(function() {
                    obj[name].apply(obj, args);
                });
            }
        }

        /**
         * @class Shvua.ExtPromise
         * @extends Promise
         * @constructor
         */
        function ExtPromise(){
            Promise.apply(this, arguments);

            methods.forEach(function(name){
                this[name] = wrap(name);
            }.bind(this));
        }

        methods.forEach(function(name){
            wrapped_methods[name] = wrap(name);
        });

        extend(ExtPromise, Promise, {});

        return ExtPromise;
    };

    return Shvua;
}));
