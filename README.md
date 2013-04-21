Promise.js
===========

This library provides a [Promises/A+](http://promises-aplus.github.io/promises-spec/) compatible
Promise object.
In addition to providing the basic implementation of the Promise API, this library also allows you to create
chainable promise APIs for you objects.

For example - let's say we have the following object:

```js
var obj = {
    async : function(){
        return new Promise(function(f,r){
            //some async operation
        });
    },
    setA : function(a){ this.a = a;}
};
```

Using `Promise.extend`, we can make `obj`'s `async` method create a costume promise object that will provide
a deffered access to `obj`'s methods:

```js
obj.Promise = Promise.extend(obj, ['setA']);
obj.async = function(){
    return new obj.Promise(function(f,r){
        //some async operation
    });
};

obj.async().setA('a');
obj.a; //undefined
//after async was completed:
obj.a; //'a'

```
What's cool about these new costume Promises is that all API points return new promises, so the same error handling
mechanism governs them. This way:

```js
obj.async()
   .then(function(){
      //do somthing
   })
   .setA('a')
   .then(fuction(){
      throw "test error";
   })
   .setA('b')
   .then(function(){}, function(e){
      console.log(obj.a);//a
      console.log(e);//test error
   });
```