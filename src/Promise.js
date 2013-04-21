(function (root, factory) {
    if (typeof exports === 'object') {
        var Events = require('Events').Events;
        module.exports = factory(Events);
    } else if (typeof define === 'function' && define.amd) {
        define(['Events'],function (Events) {
            return factory(Events.Events);
        });
    } else {
        root.Promise = factory(Events);
    }
}(this, function (Events){
    /**
     * @module Promise
     */

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

    /**
     * @class Promise
     * @constructor
     * @uses Events
     *
     * @param {fucntion} [cb] a function to use for updating promise state. Paramaters passed to callback will be fullfil function and reject function.
     */
    function Promise(cb){
        var fulfill = this.fulfill.bind(this),
            reject  = this.reject.bind(this);

        Events.call(this);
        this._addEvents = this.addEvents;
        this._fireEvent = this.fireEvent;

        if (!cb) return;

        async(function(){
            cb(fulfill, reject);
        });
    }

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
         * @property isFulfilled
         * whether or not promise has been fulfilled
         * @type Boolean
         */
        isFulfilled : false,

        /**
         * @property isRejected
         * whether or not promise has been rejected
         * @type Boolean
         */
        isRejected : false,
        /**
         * @property fulfillment_state
         * @type Promise.STATES
         */
        fulfillment_state : Promise.STATES.PENDING,
        /**
         * @property fulfillment_value
         * value of fulfilled promise
         */
        fulfillment_value : undef,
        /**
         * @property rejection_reason
         * reason for rejected promise
         */
        rejection_reason : undef,
        createPromise : function(){
            var cnstr = this.constructor;

            return new cnstr();
        },

        /**
         * This method allows the user to take action upon promise fulfillment or rejection
         * @method then
         *
         * @param {function} [cb] a callback to call when promise has been fulfilled. Will be passed promise's value.
         *                        for more info look in spec.
         * @param {function} [err] a callback to call upon rejection. Will be passed promise's rejection reason.
         * @returns {Promise}
         */
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
                        async(function(){promise.reject(error);});
                        return;
                    }

                    if (value && value.then){
                        value.then(function(value){
                            promise.fulfill(value);
                        }, function(err) {
                            promise.reject(err);
                        });
                    }else {
                        async(function(){promise.fulfill(value);});
                    }
                },
                'reject' : function(e) {
                    err && err(e.args);
                    async(function(){promise.reject(e.args);});
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
        /**
         * this method can be used to reject a promise outside the scope
         *
         * @param reason
         * @chainable
         */
        reject : function(reason) {
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


    /**
     * This method can be used to create custom promises that would wrap an object's methods
     * @method extend
     * @static
     *
     * @param {mixed} obj target object
     * @param {array} methods a list of method names to wrap
     * @returns {Promise} a new extended Promise constructor
     */
    Promise.extend = function(obj, methods){
        var wrapped_methods = {};

        function wrap(name){
            return function(){
                var args = [].slice.call(arguments);

                return this.then(function() {
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
}));
