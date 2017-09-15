# node-simple-cache #
Super simple key/value storage for NodeJS. Wouldn't say it's production ready at all but if you're working on speeding up a small hack or prototype it's easy to use for caching and similar requirements.

## Usage ##
Unless you're getting a lot of concurrent requests, you can safely stick to using `Storage.get()` and `Storage.set()` to store and retrieve data.

    var Storage = require('node-simple-cache').Storage;
    var cache = new Storage();

    if (!cache.exists('hello')) {
    	cache.set('hello', world);
    }

    cache.get('hello');			//Returns 'world'

But when requests start to pile up, calling this within a non-blocking function such as `fs.readFile()` means that you could still be calling the function multiple times before it's stored in the cache. In this case, 'Storage.async()' keeps calls in line until the value is set.

    var fs = require('fs');
    var cache = new (require('node-simple-cache').Storage)();

    //Incorrect
    fs.readFile('filename', function(err, data) {
    	if (cache.exists('hello')) {
    		console.log(cache.get('hello'));
    	} else {
    		cache.set('hello', world);
    		console.log(cache.get('hello'));
    	}
    });

    // Correct
    cache.async('hello', {
       set: function(setValue) {
           fs.readFile('filename', function(err, data) {
              setValue(data); 
           });
       },
       get: function(value) {
           console.log(value);
       }
    });
