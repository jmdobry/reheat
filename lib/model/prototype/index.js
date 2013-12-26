var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	save = require('./save'),
	destroy = require('./destroy');

module.exports = {

	// Initialize is an empty function by default. Override it with your own
	// initialization logic.
	initialize: function () {
	},

	/**
	 * @method Model#escapeHtml
	 * @desc Return the HTML-escaped version of one of this instance's attributes.
	 * @param {string} key The key of the attribute to retrieve. Supports nested keys, e.g. "address.state".
	 * @returns {string} The HTML-escaped version of one of this instance's attributes.
	 */
	escape: function (key) {
		return utils.escapeHtml(this.get(key));
	},

	/**
	 * @method Model#toJSON
	 * @desc Return the plain attributes of this instance.
	 * @instance
	 * @returns {object} The plain attributes of this instance.
	 */
	toJSON: function () {
		return utils.clone(this.attributes);
	},

	/**
	 * @method Model#contains
	 * @desc Return whether this instance's attributes contain the given value.
	 * @instance
	 * @param {*} value The value to search for within this instance.
	 * @returns {boolean} Whether this instance's attributes contain the given value.
	 */
	contains: function (value) {
		return utils.contains(this.attributes, value);
	},

	/**
	 * @method Model#functions
	 * @desc Return an array of available methods on this instance.
	 * @instance
	 * @returns {array} Array of available functions on this instance.
	 */
	functions: function () {
		return utils.functions(this);
	},

	/**
	 * @method Model#get
	 * @desc Return the attribute specified by the given key.
	 * @instance
	 * @param {string} key The key of the attribute to retrieve. Supports nested keys, e.g. "address.state".
	 * @returns {*} The attribute specified by the given key.
	 * @example
	 * contact.get('firstName'); // John
	 * contact.get('address.state'); // NY
	 */
	get: function (key) {
		return utils.get(this.attributes, key);
	},

	/**
	 * @method Model#has
	 * @desc Return whether this instance's attributes contain a property with the following key. Includes inherited
	 * properties.
	 * @param {string} key The key to search for within this instance's properties. Supports nested keys, e.g.
	 * "address.state".
	 * @instance
	 * @returns {boolean} Whether this instance's attributes contain a property with the following key.
	 */
	has: function (key) {
		return utils.has(this.attributes, key);
	},

	/**
	 * @method Model#hasOwn
	 * @desc Return an array of available methods on this instance. Does not include
	 * @param {string} key The key to search for within this instance's properties. Does not support nested keys.
	 * @instance
	 * @returns {boolean} Whether this instance's attributes contain a property with the following key.
	 */
	hasOwn: function (key) {
		return utils.hasOwn(this.attributes, key);
	},

	/**
	 * @method Model#keys
	 * @desc Return an array of keys in this instance's attributes.
	 * @instance
	 * @returns {array} Array of keys in this instance's attributes.
	 */
	keys: function () {
		return utils.keys(this.attributes);
	},

	/**
	 * @method Model#pick
	 * @desc Return a copy of this instance's attributes that contains only the whitelisted keys.
	 * @instance
	 * @returns {object} A copy of this instance's attributes that contains only the whitelisted keys.
	 */
	pick: function (keys) {
		return utils.pick(this.attributes, keys);
	},

	/**
	 * @see Model#set
	 */
	set: require('./set'),

	/**
	 * @see Model#unset
	 */
	unset: require('./unset'),

	/**
	 * @see Model#clear
	 */
	clear: require('./clear'),

	/**
	 * @method Model#clone
	 * @desc Clone the instance.
	 * @instance
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
		return !this.attributes[this.constructor.idAttribute];
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
	},

	/**
	 * @method Model#beforeValidate
	 * @summary "beforeValidate" Model lifecycle step.
	 * @desc Called immediately before the "validate" lifecycle function and executes in the context of a Model
	 * instance. The default implementation does nothing. This method can be overridden in a Model definition (see
	 * example). This method should not pass anything to the callback function unless there is an error, in which case
	 * the lifecycle will be aborted with the error.
	 * @abstract
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      beforeValidate: function (cb) {
     *          // "this" refers to an instance of Post
     *          if (this.get('author') === 'Walt Disney') {
     *              cb('Impossible!');
     *          } else {
     *              cb();
     *          }
     *  }, {
     *      tableName: 'post'
     *  });
	 *
     *  var post = new Post({ author: 'Walt Disney' });
	 *
     *  post.save(function (err, post) {
     *      err; // Impossible!
     *  });
	 */
	beforeValidate: function (cb) {
		console.log('prototype beforeValidate');
		cb(null);
	},

	/**
	 * @method Model#afterValidate
	 * @summary "afterValidate" Model lifecycle step.
	 * @desc Called immediately after the "validate" lifecycle function and executes in the context of a Model
	 * instance. The default implementation does nothing. This method can be overridden in a Model definition (see
	 * example). This method should not pass anything to the callback function unless there is an error, in which case
	 * the lifecycle will be aborted with the error.
	 * @abstract
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      afterValidate: function (cb) {
     *          // "this" refers to an instance of Post
     *          if (this.get('author') === 'Walt Disney') {
     *              cb('Impossible!');
     *          } else {
     *              cb();
     *          }
     *  }, {
     *      tableName: 'post'
     *  });
	 *
     *  var post = new Post({ author: 'Walt Disney' });
	 *
     *  post.save(function (err, post) {
     *      err; // Impossible!
     *  });
	 */
	afterValidate: function (cb) {
		cb(null);
	},

	/**
	 * @method Model#validate
	 * @summary Validate the current attributes of this instance.
	 * @desc This method does nothing if the Model of this instance does not have an instance of Schema. If this Model
	 * has an instance of Schema, the current attributes of this instance will be validated with the Schema instance.
	 * This method can be overridden for complete custom validation behavior.
	 * @abstract
	 * @param {function} cb Callback function.
	 */
	validate: function (cb) {
		if (this.schema) {
			var errors = this.schema.validate(this.attributes);
			if (errors) {
				this.validationError = errors;
				cb(errors);
			} else {
				cb(null);
			}
		} else {
			cb(null);
		}
	},

	/**
	 * @method Model#beforeCreate
	 * @summary "beforeCreate" Model lifecycle step.
	 * @desc Called immediately before the "create" lifecycle function (the step when a Model instance is saved to the
	 * server for the first time) and executes in the context of a Model instance. The default implementation does
	 * nothing. This method can be overridden in a Model definition (see example). This method should not pass anything
	 * to the callback function unless there is an error, in which case the lifecycle will be aborted with the error.
	 * @abstract
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      beforeCreate: function (cb) {
     *          // "this" refers to an instance of Post
     *          if (this.get('author') === 'Walt Disney') {
     *              cb('Impossible!');
     *          } else {
     *              cb();
     *          }
     *  }, {
     *      tableName: 'post'
     *  });
	 *
     *  var post = new Post({ author: 'Walt Disney' });
	 *
     *  post.save(function (err, post) {
     *      err; // Impossible!
     *  });
	 */
	beforeCreate: function (cb) {
		cb(null);
	},

	/**
	 * @method Model#afterCreate
	 * @summary "afterCreate" Model lifecycle step.
	 * @desc Called immediately after the "create" lifecycle function (the step when a Model instance is saved to the
	 * server for the first time) and executes in the context of a Model instance. The default implementation does
	 * nothing. This method can be overridden in a Model definition (see example). This method should pass along the
	 * instance and meta arguments to the callback function, unless there is an error, in which case the lifecycle will
	 * be aborted with the error. The inserted row is still in the database at this point, and it is currently up to the
	 * developer to remove it.
	 * @abstract
	 * @param {object} instance The instance of the Model.
	 * @param {object} meta Meta information about the database operation that was just performed.
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      afterCreate: function (instance, meta, cb) {
     *          // "this" refers to an instance of Post, and in this case, the "instance" argument is also a reference
     *          // to "this"
     *
     *          // e.g. send a transactional email, log the activity, etc.
     *
     *          cb(null, instance, meta);
     *  }, {
     *      tableName: 'post'
     *  });
	 */
	afterCreate: function (instance, meta, cb) {
		cb(null, instance, meta);
	},

	/**
	 * @method Model#beforeUpdate
	 * @summary "beforeUpdate" Model lifecycle step.
	 * @desc Called immediately before the "update" lifecycle function (the step when a Model instance is saved to the
	 * server) and executes in the context of a Model instance. The default implementation does nothing. This method
	 * can be overridden in a Model definition (see example). This method should not pass anything to the callback
	 * function unless there is an error, in which case the lifecycle will be aborted with the error.
	 * @abstract
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      beforeUpdate: function (cb) {
     *          // "this" refers to an instance of Post
     *          if (this.get('author') === 'Walt Disney') {
     *              cb('Impossible!');
     *          } else {
     *              cb();
     *          }
     *  }, {
     *      tableName: 'post'
     *  });
	 *
     *  Post.get(45, function (err, post) {
     *
     *      post.set('author', 'Walt Disney');
     *      post.save(function (err, post) {
     *          err; // Impossible!
     *      });
	 *  });
	 */
	beforeUpdate: function (cb) {
		cb(null);
	},

	/**
	 * @method Model#afterUpdate
	 * @summary "afterUpdate" Model lifecycle step.
	 * @desc Called immediately after the "update" lifecycle function (the step when a Model instance is saved to the
	 * database) and executes in the context of a Model instance. The default implementation does nothing. This method
	 * can be overridden in a Model definition (see example). This method should pass along the instance and meta
	 * arguments to the callback function, unless there is an error, in which case the lifecycle will be aborted with
	 * the error. The row in the database has still been updated at this point, and for now it is up to the developer to
	 * roll back the changes in case of an error.
	 * @abstract
	 * @param {object} instance The instance of the Model.
	 * @param {object} meta Meta information about the database operation that was just performed.
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      afterUpdate: function (instance, meta, cb) {
     *          // "this" refers to an instance of Post, and in this case, the "instance" argument is also a reference
     *          // to "this"
     *
     *          // e.g. send a transactional email, log the activity, etc.
     *
     *          cb(null, instance, meta);
     *  }, {
     *      tableName: 'post'
     *  });
	 */
	afterUpdate: function (instance, meta, cb) {
		cb(null, instance, meta);
	},

	/**
	 * @method Model#beforeDestroy
	 * @summary "beforeDestroy" Model lifecycle step.
	 * @desc Called immediately before the "destroy" lifecycle function (the step when a Model instance is removed (or
	 * deleted) from the database) and executes in the context of a Model instance. The default implementation does
	 * nothing. This method can be overridden in a Model definition (see example). This method should not pass anything
	 * to the callback function unless there is an error, in which case the lifecycle will be aborted with the error.
	 * @abstract
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      beforeDestroy: function (cb) {
     *          // "this" refers to an instance of Post
     *          if (this.get('author') === 'Walt Disney') {
     *              cb('Impossible!');
     *          } else {
     *              cb();
     *          }
     *  }, {
     *      tableName: 'post'
     *  });
	 *
     *  Post.get(45, function (err, post) {
     *      post.destroy(function (err, post) {
     *          err; // Impossible!
     *      });
	 *  });
	 */
	beforeDestroy: function (cb) {
		cb(null);
	},

	/**
	 * @method Model#afterDestroy
	 * @summary "afterDestroy" Model lifecycle step.
	 * @desc Called immediately after the "destroy" lifecycle function (the step when a Model instance is removed (or
	 * soft deleted) from the database) and executes in the context of a Model instance. The default implementation does
	 * nothing. This method can be overridden in a Model definition (see example). This method should pass along the
	 * instance and meta arguments to the callback function, unless there is an error, in which case the lifecycle will
	 * be aborted with the error. The row in the database has still been updated at this point, and for now it is up to
	 * the developer to roll back the changes in case of an error.
	 * @abstract
	 * @param {object} instance The instance of the Model.
	 * @param {object} meta Meta information about the database operation that was just performed.
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      afterDestroy: function (instance, meta, cb) {
     *          // "this" refers to an instance of Post, and in this case, the "instance" argument is also a reference
     *          // to "this"
     *
     *          // e.g. send a transactional email, log the activity, etc.
     *
     *          cb(null, instance, meta);
     *  }, {
     *      tableName: 'post'
     *  });
	 */
	afterDestroy: function (instance, meta, cb) {
		cb(null, instance, meta);
	}
};
