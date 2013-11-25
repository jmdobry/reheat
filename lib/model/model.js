'use strict';

var mout = require('mout');

module.exports = {

	// A hash of attributes whose current and previous value differ.
	changed: null,

	// The value returned during the last failed validation.
	validationError: null,

	// The default name for the JSON `id` attribute is `"id"`. MongoDB and
	// CouchDB users may want to set this to `"_id"`.
	idAttribute: 'id',

	// Initialize is an empty function by default. Override it with your own
	// initialization logic.
	initialize: function () {
	},

	// Get the HTML-escaped value of an attribute.
	escape: function (key) {
		return mout.string.escapeHtml(this.get(key));
	},

	toJSON: function toJSON() {
		return mout.lang.clone(this.attributes);
	},

	contains: function contains(value) {
		return mout.object.contains(this.attributes, value);
	},

	functions: function functions() {
		return mout.object.functions(this);
	},

	get: function get(key) {
		return mout.object.get(this.attributes, key);
	},

	has: function has(key) {
		return mout.object.has(this.attributes, key);
	},

	hasOwn: function hasOwn(key) {
		return mout.object.hasOwn(this.attributes, key);
	},

	keys: function keys() {
		return mout.object.keys(this.attributes);
	},

	pick: function pick(keys) {
		return mout.object.pick(this.attributes, keys);
	},

	pluck: function pluck(key) {
		return mout.object.pluck(this.attributes, key);
	},

	set: function set(key, value) {
		if (mout.lang.isObject(key)) {
			mout.object.deepMixIn(this.attributes, key);
		} else {
			mout.object.set(this.attributes, key, value);
		}
	},

	unset: function unset(key) {
		mout.object.unset(this.attributes, key);
	},

	clear: function clear() {
		this.attributes = {};
	},

	values: function values() {
		return mout.object.values(this.attributes);
	},

	// Create a new model with identical attributes to this one.
	clone: function clone() {
		return new this.constructor(this.attributes);
	},

	// A model is new if it has never been saved to the server, and lacks an id.
	isNew: function isNew() {
		return this.id == null;
	},

	// Check if the model is currently in a valid state.
	isValid: function isValid(options) {
		return this._validate({}, mout.object.deepMixIn(options || {}, { validate: true }));
	},

	// Run validation against the next complete set of model attributes,
	// returning `true` if all is well. Otherwise, fire an `"invalid"` event.
	_validate: function _validate(attrs, options) {
		if (!options.validate || !this.validate) return true;
		attrs = mout.object.deepMixIn({}, this.attributes, attrs);
		var error = this.validationError = this.validate(attrs, options) || null;
		if (!error) return true;
		this.trigger('invalid', this, error, mout.object.deepMixIn(options, {validationError: error}));
		return false;
	}
};
