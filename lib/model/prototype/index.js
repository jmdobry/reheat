'use strict';

var mout = require('mout');

module.exports = {

	// Initialize is an empty function by default. Override it with your own
	// initialization logic.
	initialize: function () {
	},

	// Get the HTML-escaped value of an attribute.
	escape: function (key) {
		return mout.string.escapeHtml(this.get(key));
	},

	toJSON: function () {
		return mout.lang.clone(this.attributes);
	},

	contains: function (value) {
		return mout.object.contains(this.attributes, value);
	},

	functions: function () {
		return mout.object.functions(this);
	},

	get: function (key) {
		return mout.object.get(this.attributes, key);
	},

	has: function (key) {
		return mout.object.has(this.attributes, key);
	},

	hasOwn: function (key) {
		return mout.object.hasOwn(this.attributes, key);
	},

	keys: function () {
		return mout.object.keys(this.attributes);
	},

	pick: function (keys) {
		return mout.object.pick(this.attributes, keys);
	},

	pluck: function (key) {
		return mout.object.pluck(this.attributes, key);
	},

	set: function (key, value) {
		if (mout.lang.isObject(key)) {
			mout.object.deepMixIn(this.attributes, key);
		} else {
			mout.object.set(this.attributes, key, value);
		}
	},

	unset: function (key) {
		mout.object.unset(this.attributes, key);
	},

	clear: function () {
		this.attributes = {};
	},

	values: function () {
		return mout.object.values(this.attributes);
	},

	// Create a new model with identical attributes to this one.
	clone: function () {
		return new this.constructor(this.attributes);
	},

	// A model is new if it has never been saved to the server, and lacks an id.
	isNew: function () {
		return !this.attributes[this.idAttribute];
	},

	save: function (attrs, cb) {
		console.log('save', attrs);
		cb(null, attrs, { created: 1 });
	},

	destroy: function (cb) {
		console.log('destroy');
		cb(null, { deleted: 1 });
	}
};
