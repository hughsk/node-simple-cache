var cache = require('./simple-cache.js'),
	store = new cache.Storage({ delay: 500 });

store.async('setters', {
	set: function(setValue) {
		setValue(200);
	}
});

store.async('setters', {
	get: function(value) {
		console.log(value);
	}
});

var l = 0, s = 0, start = new Date().getTime(), t = 0;
setInterval(function() {
	t += 1;
}, 1);
for (var i = 0; i < 10000; i += 1) {
	store.async('loops', {
		set: function(set) {
			setTimeout(function() {
				s += 1; set(10); console.log('set');
			}, 1000);
		},
		get: function(value) {
			l += 1; console.log(l, value, new Date().getTime() - start, t);
		},
		perFrame: 10,
	});
}

setTimeout(function() {
	console.log(i + ' == ' + l + ' && ' + s + ' == ' + 1);
	console.log(t);
}, 5000);