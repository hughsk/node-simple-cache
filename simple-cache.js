/**
 * Creates a new storage instance.
 * @constructor
 */
var Storage = function(options) {
	this.storage = {};
	this.timeouts = {};
	this.queued = {};
	this.queues = {};
	
	options = options || {};
	this.delay = options.delay || 60000;
}

/**
 * @function Storage.get(key)
 * @description Retrieves the value of a stored key.
 * @param key The key to look up.
 * @returns The value stored under this key, or undefined.
 */
Storage.prototype.get = function(key) {
	return this.exists(key)?this.storage[key]:undefined;
}

/**
 * @function Storage.set(key, value)
 * @description Sets a value under the supplied key, if it has not been set already.
 * @param key The key to look up.
 * @param value The value to set the key to.
 * @param delay (optional) How long to store the value in the cache, in seconds.
 * @returns {Storage} The storage instance. 
 */
Storage.prototype.set = function(key, value, delay) {
	if (!this.storage[key]) {
		var me = this;
		this.storage[key] = value;
		this.timeouts[key] = setTimeout(function() {
			console.log('clearing cache');
			this.master.clear(this.key);
		}, delay*1000 || this.delay);
		this.timeouts[key].master = this;
		this.timeouts[key].key = key;
	}
	return this;
}

/**
 * @function Storage.exists(key)
 * @description Checks whether or not a key has been stored in the cache.
 * @param key The key to check.
 * @returns {Boolean}
 */
Storage.prototype.exists = function(key) {
	return this.storage[key] !== undefined; 
}

/**
 * @function Storage.clear(key)
 * @description Unsets the value under the selected key.
 * @param key The key to unset.
 * @returns {Storage} The storage instance.
 */
Storage.prototype.clear = function(key) {
	delete this.storage[key];
	clearTimeout(this.timeouts[key]);
	delete this.timeouts[key];
	return this;
}

/**
 * @function Storage.override(key, value, delay)
 * @description Overrides a currently stored value.
 * @param key The key to override.
 * @param value The new value to store in this key.
 * @param delay The new lifetime of the stored value.
 */
Storage.prototype.override = function(key, value, delay) {
	this.clear(key).set(key, value, delay);
}

/**
 * Intended for situations where storing a value to the cache may
 *  depend on asynchronous functions that could overlap.
 *
 * "first" will only be called once, and in the meantime all other
 *  requests will be added to a queue. Once the value is set, the
 * "later" callback will be called on all pending requests.
 *
 * @function Storage.async(key, first, later)
 * @param key The key to store the value under.
 * @param first The callback for defining the key.
 * @param later The callback for all subsequent attempts.
 * @param delay The lifetime the value will have.
 */
Storage.prototype.async = function(key, first, later, delay) {
	if (this.exists(key)) {
		later(this.get(key));
	} else
	if (!this.queued[key]) {
		var master = this;
		this.queued[key] = true;

		first(function(value) {
			master.set(key, value, delay || master.delay);
			delete master.queued[key];

			if (master.queues[key]) {
				for (var i=0,l=master.queues[key].length;i<l;i++) {
					master.queues[key][i](value);
				}
				delete master.queues[key];
			}
		});
		
	} else {
		this.queues[key] = this.queues[key] || [];
		this.queues[key].push(later);
	}
}

module.exports.Storage = Storage;