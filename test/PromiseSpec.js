describe(['Promise'], "Promise", function(Promise){
    var undef;

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
        function empty(){};
        var names = 'addEvent fireEvent addEvents fireLatchedEvent'.split(' '),
            obj = {},
            promise,p;

        names.forEach(function(name){obj[name]=empty});

        promise = Promise.extend(obj, names);

        p = new Promise(function(f){
            f(1)
        }).addEvent('foo').then(function(value){
            done();
        })
    });
});