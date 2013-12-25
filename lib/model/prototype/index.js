var mout = require('mout'),
	save = require('./save'),
	destroy = require('./destroy');

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

	/**
	 * @method Model#get
	 * @param {string} key The key of the attribute to retrieve. Supports nested keys, e.g. "address.state".
	 * @returns {*}
	 * @example
	 * contact.get('firstName'); // John
	 * contact.get('address.state'); // NY
	 */
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

	/**
	 * @method Model#set
	 * @param {string|object} key If a string, the key of the value to set. Supports nested keys, e.g. "address.state".
	 * If an object, the object will be merged into the instance's attributes.
	 * @param {*} value The value to set.
	 * @example
	 *  var contact = new Contact({
	 *      address: {
	 *          city: 'New York'
	 *      }
	 *  });
	 *
	 *  contact.set({
	 *      firstName: 'John',
	 *      lastName: 'Anderson'
	 *  });
	 *
	 *  contact.set('email', 'john.anderson@gmail.com');
	 *
	 *  contact.set('address.state', 'NY');
	 *
	 *  contact.toJSON();   //  {
	 *                      //      firstName: 'John',
	 *                      //      lastName: 'Anderson',
	 *                      //      email: 'john.anderson@gmail.com',
	 *                      //      address: {
	 *                      //          state: 'NY'
	 *                      //      }
	 *                      //  }
	 */
	set: function (key, value) {
		if (mout.lang.isObject(key)) {
			mout.object.deepMixIn(this.attributes, key);
		} else {
			mout.object.set(this.attributes, key, value);
		}
	},

	/**
	 * @method Model#unset
	 * @desc Unset a property of the instance. Supports nested keys, e.g. "address.state".
	 * @param {string} key The property to unset.
	 * @example
	 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
	 *
	 *  contact.unset('address.state');
	 *
	 *  contact.toJSON();   //  { firstName: 'John' }
	 */
	unset: function (key) {
		mout.object.unset(this.attributes, key);
	},

	/**
	 * @method Model#clear
	 * @desc Clear the attributes of the instance.
	 * @example
	 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
	 *
	 *  contact.clear();
	 *
	 *  contact.toJSON();   //  { }
	 */
	clear: function () {
		this.attributes = {};
	},

	/**
	 * @method Model#clone
	 * @desc Clone the instance.
	 * @returns {*} A new identical instance of Model.
	 * @example
	 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
	 *
	 *  var clone = contact.clone();
	 *
	 *  clone.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
	 */
	clone: function () {
		return new this.constructor(this.attributes);
	},

	/**
	 * @method Model#isNew
	 * @desc Return true if the instance has not yet been saved to the database (lacks the property specified by
	 * {@link Model.idAttribute} (default is "id").
	 * @returns {boolean}
	 * @example
	 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
	 *  contact.isNew();   //  true
	 *
	 *  contact.save(function (err, contact) {
	 *      contact.toJSON();   //  { id: 45, address: { state: 'NY' }, firstName: 'John' }
	 *      contact.isNew();    //  false
	 *  });
	 */
	isNew: function () {
		return !this.attributes[this.contructor.idAttribute];
	},

	/**
	 * @see Model#save
	 */
	save: function (cb) {
		save.apply(this, [cb]);
	},

	/**
	 * @see Model#destroy
	 */
	destroy: function (cb) {
		destroy.apply(this, [cb]);
	}
};
