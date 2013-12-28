var utils = require('./utils');

// Extend function used by Backbone.js
module.exports = function extend(protoProps, staticProps) {
	var parent = this;
	var child = function () {
		return parent.apply(this, arguments);
	};

	// Add static properties to the constructor function, if supplied.
	utils.deepMixIn(child, parent, staticProps);

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
		utils.deepMixIn(child.prototype, protoProps);
	}

	// Set a convenience property in case the parent's prototype is needed
	// later.
	child.__super__ = parent.prototype;

	return child;
};
