var utils = require('../../support/utils'),
	errors = require('../../support/errors');

module.exports = {

	/**
	 * @method Model#initialize
	 * @desc Called at the end of construction of Model instances. Override this method via {@link Model#extend} to
	 * execute custom initialization logic when instantiating new instances of Model.
	 * @abstract
	 * @instance
	 * @example
	 *  var Post = Model.extend({
	 *      initialize: function () {
	 *          this.dirty = false;
	 *      }
	 *  }, {
	 *      tableName: 'post',
	 *      connection: new Connection()
	 *  });
	 *
	 *  var post = new Post();
	 *
	 *  post.dirty; // false
	 */
	initialize: function () {
	},

	/**
	 * @method Model#escapeHtml
	 * @desc Return the HTML-escaped version of one of this instance's attributes.
	 * @instance
	 * @param {string} key The key of the attribute to retrieve. Supports nested keys, e.g. "address.state".
	 * @returns {string} The HTML-escaped version of one of this instance's attributes.
	 * @throws {IllegalArgumentError} Argument "key" must be a string.
	 */
	escape: function (key) {
		if (!utils.isString(key)) {
			throw new errors.IllegalArgumentError('Model#escapeHtml(key): key: Must be a string!', { actual: typeof key, expected: 'string' });
		}
		try {
			return utils.escapeHtml(this.get(key));
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
	},

	/**
	 * @method Model#toJSON
	 * @desc Return the plain attributes of this instance. Override this method to se your own custom  serialization.
	 * @instance
	 * @returns {object} The plain attributes of this instance.
	 * @example
	 *  var post = new Post({ author: 'John Anderson' });
	 *
	 *  post;   //  {
	 *          //      attributes: { author: 'John Anderson' },
	 *          //      ...
	 *          //  }
	 *
	 *  post.toJSON();  //  { author: 'John Anderson' }
	 * @example
	 *  // Example of overriding toJSON()
	 *  var Post = Model.extend({
	 *      toJSON: function () {
	 *          var attrs = Model.prototype.toJSON.call(this);
	 *          delete attrs.secretField;
	 *          return attrs;
	 *      }
	 *  });
	 *
	 *  var post = new Post({ author: 'John Anderson', secretField: 'mySecret' });
	 *
	 *  post;   //  {
	 *          //      attributes: { author: 'John Anderson', secretField: 'mySecret' },
	 *          //      ...
	 *          //  }
	 *
	 *  post.toJSON();  //  { author: 'John Anderson' }
	 */
	toJSON: function () {
		try {
			return utils.clone(this.attributes);
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
	},

	/**
	 * @method Model#functions
	 * @desc Return an array of available methods on this instance.
	 * @instance
	 * @returns {array} Array of available functions on this instance.
	 */
	functions: function () {
		try {
			return utils.functions(this);
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
	},

	/**
	 * @method Model#get
	 * @desc Return the attribute specified by the given key.
	 * @instance
	 * @param {string} key The key of the attribute to retrieve. Supports nested keys, e.g. "address.state".
	 * @returns {*} The attribute specified by the given key.
	 * @throws {IllegalArgumentError} Argument "key" must be a string.
	 * @example
	 *  var contanct = new Contact({
	 *      firstName: 'John',
	 *      address: {
	 *          state: 'NY'
	 *      }
	 *  });
	 *
	 *  contact.get('firstName'); // John
	 *
	 *  contact.get('address.state'); // NY
	 */
	get: function (key) {
		if (!utils.isString(key)) {
			throw new errors.IllegalArgumentError('Model#get(key): key: Must be a string!', { actual: typeof key, expected: 'string' });
		}
		try {
			return utils.get(this.attributes, key);
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
	},

	/**
	 * @method Model#has
	 * @desc Return whether this instance's attributes contain a property with the following key. Includes inherited
	 * properties.
	 * @instance
	 * @param {string} key The key to search for within this instance's properties. Supports nested keys, e.g.
	 * "address.state".
	 * @returns {boolean} Whether this instance's attributes contain a property with the following key.
	 * @throws {IllegalArgumentError} Argument "key" must be a string.
	 * @example
	 *  var contanct = new Contact({
	 *      firstName: 'John',
	 *      address: {
	 *          state: 'NY'
	 *      },
	 *      'will.not.work': 'for this method'
	 *  });
	 *
	 *  contact.has('firstName'); // true
	 *  contact.has('lastName'); // false
	 *
	 *  contact.has('address.state'); // true
	 *  contact.has('address.city'); // false
	 *
	 *  // use Model#hasOwn to test for keys with dots in them
	 *  contact.has('will.not.work'); // false
	 */
	has: function (key) {
		if (!utils.isString(key)) {
			throw new errors.IllegalArgumentError('Model#has(key): key: Must be a string!', { actual: typeof key, expected: 'string' });
		}
		try {
			return utils.has(this.attributes, key);
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
	},

	/**
	 * @method Model#hasOwn
	 * @desc Return an array of available methods on this instance. Does not include
	 * @instance
	 * @param {string} key The key to search for within this instance's properties. Does not support nested keys.
	 * @returns {boolean} Whether this instance's attributes contain a property with the following key.
	 * @throws {IllegalArgumentError} Argument "key" must be a string.
	 * @example
	 *  var contanct = new Contact({
	 *      firstName: 'John',
	 *      address: {
	 *          state: 'NY'
	 *      },
	 *      'will.not.work': 'for this method'
	 *  });
	 *
	 *  contact.has('firstName'); // true
	 *  contact.has('lastName'); // false
	 *
	 *  contact.has('address.state'); // false
	 *  contact.has('address.city'); // false
	 *
	 *  contact.has('will.not.work'); // true
	 */
	hasOwn: function (key) {
		if (!utils.isString(key)) {
			throw new errors.IllegalArgumentError('Model#hasOwn(key): key: Must be a string!', { actual: typeof key, expected: 'string' });
		}
		try {
			return utils.hasOwn(this.attributes, key);
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
	},

	/**
	 * @see Model#set
	 */
	set: require('./set'),

	/**
	 * @see Model#setSync
	 */
	setSync: require('./setSync'),

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
	 * @returns {*} A new instance identical to this instance.
	 * @example
	 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
	 *
	 *  var cloned = contact.clone();
	 *
	 *  cloned.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
	 *  cloned.set
	 */
	clone: function () {
		try {
			return new this.constructor(this.attributes);
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
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
	save: require('./save'),

	/**
	 * @see Model#destroy
	 */
	destroy: require('./destroy'),

	/**
	 * @method Model#beforeValidate
	 * @summary <code>beforeValidate</code> Model lifecycle step.
	 * @desc Called immediately before {@link Model#validate} is called and executes in the context this instance. The
	 * default implementation does nothing. This method can be overridden via {@link Model#extend}. This method should
	 * not pass anything to the callback function unless there is an error, in which case the lifecycle will be aborted
	 * with the error.
	 * @abstract
	 * @instance
	 * @param {function} cb Callback function. Signature: <code>cb(err)</code>.
	 * @see Model#extend
	 * @see Model#save
	 * @see Model#validate
	 * @see Model#afterValidate
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
     *      tableName: 'post',
     *      connection: new Connection()
     *  });
	 *
     *  var post = new Post({ author: 'Walt Disney' });
	 *
     *  post.save(function (err, post) {
     *      err; // Impossible!
     *  });
	 */
	beforeValidate: function (cb) {
		cb(null);
	},

	/**
	 * @method Model#afterValidate
	 * @summary <code>afterValidate</code> Model lifecycle step.
	 * @desc Called immediately after {@link Model#validate} is called and executes in the context of this instance. The
	 * default implementation does nothing. This method can be overridden via {@link Model#extend}. This method should
	 * not pass anything to the callback function unless there is an error, in which case the lifecycle will be aborted
	 * with the error.
	 * @abstract
	 * @instance
	 * @param {function} cb Callback function. Signature: <code>cb(err)</code>
	 * @see Model#extend
	 * @see Model#save
	 * @see Model#beforeValidate
	 * @see Model#validate
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
     *      tableName: 'post',
     *      connection: new Connection()
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
	 * @param {function} cb Callback function. Signature: <code>cb(err)</code>.
	 * @see robocop.Schema
	 * @see Model.schema
	 * @example
	 *  var Post = Model.extend({
     *      validate: function (cb) {
     *          // "this" refers to an instance of Post
     *          if (typeof this.get('author') !== 'string') {
     *              cb('type error');
     *          } else {
     *              cb();
     *          }
     *  }, {
     *      tableName: 'post',
     *      connection: new Connection()
     *  });
	 *
     *  var post = new Post({ author: 4435 });
	 *
     *  post.save(function (err, post) {
     *      err; // type error
     *  });
	 */
	validate: function (cb) {
		var _this = this;

		if (this.constructor.schema) {
			this.constructor.schema.validate(this.attributes, function (err) {
				if (err) {
					_this.validationError = new errors.ValidationError('Model#validate(cb): Validation failed!', err);
					cb(_this.validationError);
				} else {
					cb(null);
				}
			});
		} else {
			cb(null);
		}
	},

	/**
	 * @method Model#beforeCreate
	 * @summary <code>beforeCreate</code> Model lifecycle step.
	 * @desc Called immediately before this instance is saved to the database for the first time and executes in the
	 * context of this instance. The default implementation does nothing. This method can be overridden via
	 * {@link Model#extend}. This method should not pass anything to the callback function unless there is an error, in
	 * which case the lifecycle will be aborted with the error.
	 * @abstract
	 * @instance
	 * @param {function} cb Callback function. Signature: <code>cb(err)</code>.
	 * @see Model#extend
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
     *      tableName: 'post',
     *      connection: new Connection()
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
	 * @summary <code>afterCreate</code> Model lifecycle step.
	 * @desc Called immediately after this instance is saved to the database for the first time. The default
	 * implementation does nothing. This method can be overridden via {@link Model#extend}. This method should pass
	 * along the instance and meta arguments to the callback function, unless there is an error, in which case the
	 * lifecycle will be aborted with the error. The inserted row is still in the database at this point, and it is
	 * currently up to the developer to remove it.
	 * @abstract
	 * @instance
	 * @param {object} instance The instance of the Model.
	 * @param {object} meta Meta information about the database operation that was just performed. See
	 * {@link http://rethinkdb.com/api/javascript/#insert}.
	 * @param {function} cb Callback function. Signature: <code>cb(err, instance, meta)</code>.
	 * @see Model#extend
	 * @see Model#save
	 * @see Model#beforeCreate
	 * @see http://rethinkdb.com/api/javascript/#insert.
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
     *      tableName: 'post',
     *      connection: new Connection()
     *  });
	 */
	afterCreate: function (instance, meta, cb) {
		cb(null, instance, meta);
	},

	/**
	 * @method Model#beforeUpdate
	 * @summary <code>beforeUpdate</code> Model lifecycle step.
	 * @desc Called immediately before the row specified by this instance's primary key is updated with this instance's
	 * current attributes. The default implementation does nothing. This method can be overridden via
	 * {@link Model#extend}. This method should not pass anything to the callback function unless there is an error, in
	 * which case the lifecycle will be aborted with the error.
	 * @abstract
	 * @instance
	 * @param {function} cb Callback function. Signature: <code>cb(err)</code>.
	 * @see Model#extend
	 * @see Model#save
	 * @see Model#afterUpdate
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
     *      tableName: 'post',
     *      connection: new Connection()
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
	 * @summary <code>afterUpdate</code> Model lifecycle step.
	 * @desc Called immediately after the row specified by this instance's primary key is updated with this instance's
	 * current attributes and executes in the context this instance. The default implementation does nothing. This
	 * method can be overridden via {@link Model#extend}. This method should pass along the instance and meta
	 * arguments to the callback function, unless there is an error, in which case the lifecycle will be aborted with
	 * the error. The row in the database has still been updated at this point, and for now it is up to the developer to
	 * roll back the changes in case of an error. The old value of the updated row is in <code>meta.old_val</code> or
	 * <code>this.previousAttributes</code>.
	 * @abstract
	 * @instance
	 * @param {object} instance The instance of the Model.
	 * @param {object} meta Meta information about the database operation that was just performed. See
	 * {@link http://rethinkdb.com/api/javascript/#update}.
	 * @param {function} cb Callback function. Signature: <code>cb(err, instance, meta)</code>.
	 * @see Model#extend
	 * @see Model#save
	 * @see Model#beforeUpdate
	 * @see http://rethinkdb.com/api/javascript/#update.
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
     *      tableName: 'post',
     *      connection: new Connection()
     *  });
	 */
	afterUpdate: function (instance, meta, cb) {
		cb(null, instance, meta);
	},

	/**
	 * @method Model#beforeDestroy
	 * @summary <code>beforeDestroy</code> Model lifecycle step.
	 * @desc Called immediately before {@link Model#destry} and executes in the context of this instance. The default
	 * implementation does nothing. This method can be overridden via {@link Model#extend}. This method should not pass
	 * anything to the callback function unless there is an error, in which case the lifecycle will be aborted with the
	 * error.
	 * @abstract
	 * @instance
	 * @param {function} cb Callback function. Signature: <code>cb(err)</code>.
	 * @see Model#extend
	 * @see Model#destroy
	 * @see Model#afterDestroy
	 * @see http://rethinkdb.com/api/javascript/#delete.
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
     *      tableName: 'post',
     *      connection: new Connection()
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
	 * @summary <code>afterDestroy</code> Model lifecycle step.
	 * @desc Called immediately after {@link Model#extend} and executes in the context of this instance. The default
	 * implementation does nothing. This method can be overridden via {@link Model#extend}. This method should pass
	 * along the instance and meta arguments to the callback function, unless there is an error, in which case the
	 * lifecycle will be aborted with the error. The row in the database has still been updated/removed at this point,
	 * and for now it is up to the developer to roll back the changes in case of an error. The old value of the updated/
	 * deleted row is in <code>meta.old_val</code> or <code>this.previousAttributes</code>.
	 * @abstract
	 * @instance
	 * @param {object} instance This instance.
	 * @param {object} meta Meta information about the database operation that was just performed. See
	 * {@link http://rethinkdb.com/api/javascript/#delete}.
	 * @param {function} cb Callback function. Signature: <code>cb(err, instance, meta)</code>.
	 * @see Model#extend
	 * @see Model#destroy
	 * @see Model#beforeDestroy
	 * @see http://rethinkdb.com/api/javascript/#delete.
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
     *      tableName: 'post',
     *      connection: new Connection()
     *  });
	 */
	afterDestroy: function (instance, meta, cb) {
		cb(null, instance, meta);
	}
};
