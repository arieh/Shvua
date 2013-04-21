define(function(){
    function assert(value){
        expect(value).toBeTruthy();
    }

    assert.strictEqual = function(value1, value2) {
        expect(value1).toEqual(value2);
    };

    assert.notStrictEqual = function(value1, value2) {
        assert(value1 == value2);
    };

    return assert;
});
