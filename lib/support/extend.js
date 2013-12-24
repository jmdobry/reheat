var object = require('mout').object;

// Extend function used by Backbone.js
module.exports = function extend(protoProps, staticProps) {
	var parent = this;
	var child;

	// The constructor function for the new subclass is either defined by you
	// (the "constructor" property in your `extend` definition), or defaulted
	// by us to simply call the parent's constructor.
	if (protoProps && object.hasOwn(protoProps, 'constructor')) {
		child = protoProps.constructor;
	} else {
		child = function () {
			return parent.apply(this, arguments);
		};
	}

	// Add static properties to the constructor function, if supplied.
	object.deepMixIn(child, parent, staticProps);

	// Set the prototype chain to inherit from `parent`, without calling
	// `parent`'s constructor function.
	var Surrogate = function () {
		this.constructor = child;
	};
	Surrogate.prototype = parent.prototype;
	child.prototype = new Surrogate();

	// Add prototype properties (instance properties) to the subclass,
	// if supplied.
	if (protoProps) {
		object.deepMixIn(child.prototype, protoProps);
	}

	// Set a convenience property in case the parent's prototype is needed
	// later.
	child.__super__ = parent.prototype;

	return child;
};
