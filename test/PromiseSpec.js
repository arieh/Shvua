describe(['Promise'], "Promise", function(Promise){
    var undef;

    it('Should return a valid promise that fulfills properly', function(done){
        var promise = new Promise(function(fulfill){
            setTimeout(function(){
                fulfill(1);
            }, 1000);
        });

        expect(promise.isFulfilled).toEqual(false);
        expect(promise.fulfillment_value).toEqual(undef);
        expect(promise.fulfillment_state).toEqual(Promise.STATES.PENDING);

        promise.then(function(value) {
            done = 1;
            expect(value).toEqual(1);
        });
    });

    it('Should return a pending promise event if cb is sync', function(done){
        var promise = new Promise(function(f){
                f(1);
            });

        expect(promise.isFulfilled).toEqual(false);

        setTimeout(function(){
            done = 1;
            expect(promise.isFulfilled).toEqual(true);
        },0);

        waitsFor(function(){return done;}, "waiting for timeout", 500);
    });

    it('Should handle rejection properly', function(done){
        var promise = new Promise(function(f, r){
                r(1);
            });

        setTimeout(function(){
            done = 1;
            expect(promise.fulfillment_state).toEqual(Promise.STATES.REJECTED);
            expect(promise.isRejected).toEqual(true);
            expect(promise.rejection_reason).toEqual(1);
        },0);
    });

    it("Should handle simple chaining properly", function(done){
        var values = [],
            promise = new Promise(function(f) {
                f(1);
            });

        promise.then(function(value){
            values.push(value);
            return 2;
        }).then(function(value){
            values.push(value);
            return 3;
        }).then(function(value){
            values.push(3);
        });

        setTimeout(function(){
            done = 1;
            expect(values).toEqual([1,2,3]);
        }, 100);
    });

    it("Should handle chaining with rejection properly", function(done){
        var values = [],
            promise = new Promise(function(f,r){
               r(1);
            });

        promise.then(function(){
            values.push(1);
        }).then(function(){
            values.push(2);
        }).then(null, function(err){
            done = 1;
            expect(err).toEqual(1);
            expect(values).toEqual([]);
        });
    });

    it('Should handle promises as returned values properly', function(done){
        var values = [],
            promise = new Promise(function(f){
                f(new Promise(function(f){
                    f(1);
                }));
            });

        promise.then(function(value){
            values.push(value);
            return new Promise(function(f){
                f(2);
            });
        }).then(function(value){
            values.push(value);
            done = 1;

            expect(values).toEqual([1,2]);
        });
    });

    it('Should have a functioning extend method', function(done){
        function test(){
            var promise;

            this.setA = function(a){
                this.a = a;
            };

            this.setB = function(b){
                this.b = b;
            };

            this.async = function(){
                return new promise(function(f){
                    setTimeout(function(){
                        f(1);
                    }, 100);
                });
            };

            promise = Promise.extend(this, ['setA', 'setB']);
        }

        var tst = new test(), promise;

        promise = tst.async();
        promise.setA('a');

        expect(tst.a).toEqual(undef);
        expect(tst.b).toEqual(undef);


        promise.then(function(value){
            done = 1;

            expect(value).toEqual(1);
            expect(tst.a).toEqual('a');

            promise.setB('b');

            expect(tst.b).toEqual('b');
        });
    });


});