describe(['Shvua'], "Promise", function(Shvua){
    var undef, Promise = Shvua.Promise;

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

            promise = Shvua.extend(this, ['setA', 'setB']);
        }

        var tst = new test(), promise;

        promise = tst.async();
        promise.setA('a');

        expect(tst.a).toEqual(undef);
        expect(tst.b).toEqual(undef);


        promise.then(function(value){
            done();

            expect(value).toEqual(1);

            promise.setB('b');

            setTimeout(function(){
                expect(tst.a).toEqual('a');
                expect(tst.b).toEqual('b');
            }, 10);
        });
    });

    it("Should be able to function even when extending object with events api", function(done){
        var names = 'addEvent fireEvent addEvents fireLatchedEvent'.split(' '),
            values = [],
            obj = {},
            promise, p;

        function mock(v) {
            values.push(v);
        }

        names.forEach(function(name){obj[name]=mock;});

        promise = Shvua.extend(obj, names);

        p = new promise(function(f){
            f(1)
        })

        names.forEach(function(name){
            p[name](name);
        });

        expect(values.length).toEqual(0);

        p.then(function(value) {
            values.push(value);
            names.push(value);
        });

        setTimeout(function(){
            expect(values).toEqual(names);
            done();
        }, 50);
    });

    describe("Should have a `done` and `fail` method, that returns a promise", function() {
        var result = {foo:'bar'};

        it("Should have a `done` and `fail` methods that returns a promise. `Done` should run when promise is fulfilled. `Fail` should not", function(done){
            var p1 = new Shvua.Promise(),
                done_promise,
                fail_promise,
                expected= {
                    done : false,
                    fail : false
                };

            done_promise = p1.done(function(value) {
                expect(value).toEqual(result);
                expected.done = true;
            });

            fail_promise = p1.fail(function(value){
                expected.fail = true;
            });

            expect(done_promise instanceof Shvua.Promise).toEqual(true);
            expect(fail_promise instanceof Shvua.Promise).toEqual(true);

            p1.fulfill(result);

            setTimeout(function(){
                expect(expected.done).toEqual(true);
                expect(expected.fail).toEqual(false);
                done();
            });
        });



        it("Should have a `done` and `fail` methods that returns a promise. `fail` should run when promise is rejected. `done` should not", function(done){
            var p1 = new Shvua.Promise(),
                done_promise,
                fail_promise,
                expected= {
                    done : false,
                    fail : false
                };

            done_promise = p1.done(function() {
                expected.done = true;
            });

            fail_promise = p1.fail(function(reason){
                expect(reason).toEqual(result);
                expected.fail = true;
            });

            expect(done_promise instanceof Shvua.Promise).toEqual(true);
            expect(fail_promise instanceof Shvua.Promise).toEqual(true);

            p1.reject(result);

            setTimeout(function(){
                expect(expected.done).toEqual(false);
                expect(expected.fail).toEqual(true);
                done();
            });
        });
    });
});