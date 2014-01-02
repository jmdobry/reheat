var utils = require('../../support/utils'),
	errors = require('../../support/errors');

module.exports = {

	/**
	 * @doc method
	 * @id Model.instance_methods:initialize
	 * @name initialize( )
	 * @description
	 * Called at the end of construction of Model instances. Override this method via Model#extend([proto], static) to
	 * execute custom initialization logic when instantiating new instances of Model.
	 *
	 * Example:
	 *
	 * ```js
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
	 * ```
	 */
	initialize: function () {
	},

	/**
	 * @doc method
	 * @id Model.instance_methods:escapeHtml
	 * @name escapeHtml(key)
	 * @description
	 * Return the HTML-escaped version of one of this instance's attributes.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: Model#escapeHtml(key) example
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{IllegalArgumentError}` - Argument `key` must be a string.
	 * @param {string} key The key of the attribute to retrieve. Supports nested keys, e.g. `"address.state"`.
	 * @returns {string} The HTML-escaped version of one of this instance's attributes.
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
	 * @doc method
	 * @id Model.instance_methods:toJSON
	 * @name toJSON( )
	 * @description
	 * Return the plain attributes of this instance. Override this method to se your own custom  serialization.
	 *
	 * Example:
	 *
	 * ```js
	 *  var post = new Post({ author: 'John Anderson' });
	 *
	 *  post;   //  {
	 *          //      attributes: { author: 'John Anderson' },
	 *          //      ...
	 *          //  }
	 *
	 *  post.toJSON();  //  { author: 'John Anderson' }
	 *  ```
	 *
	 * You can override the `toJSON()` method for custom serialization.
	 * ```js
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
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{UnhandledError}` - Thrown for any uncaught exception.
	 *
	 * @returns {object} The plain attributes of this instance.
	 */
	toJSON: function () {
		try {
			return utils.clone(this.attributes);
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
	},

	/**
	 * @doc method
	 * @id Model.instance_methods:functions
	 * @name functions( )
	 * @description
	 * Return an array of available methods on this instance.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: Model#functions() example
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{UnhandledError}` - Thrown for any uncaught exception.
	 *
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
	 * @doc method
	 * @id Model.instance_methods:get
	 * @name get(key)
	 * @description
	 * Return the attribute specified by the given key.
	 *
	 * Example:
	 *
	 * ```js
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
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{IllegalArgumentError}` - Argument `key` must be a string.
	 * - `{UnhandledError}` - Thrown for any uncaught exception.
	 *
	 * @param {string} key The key of the attribute to retrieve. Supports nested keys, e.g. `"address.state"`.
	 * @returns {*} The attribute specified by the given key.
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

	// See reheat/lib/model/prototype/set.js
	set: require('./set'),

	// See reheat/lib/model/prototype/setSync.js
	setSync: require('./setSync'),

	// See reheat/lib/model/prototype/unset.js
	unset: require('./unset'),

	// See reheat/lib/model/prototype/clear.js
	clear: require('./clear'),

	/**
	 * @doc method
	 * @id Model.instance_methods:clone
	 * @name clone( )
	 * @description
	 * Clone this instance.
	 *
	 * Example:
	 *
	 * ```js
	 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
	 *
	 *  var cloned = contact.clone();
	 *
	 *  cloned.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
	 *  cloned.setSync('firstName', 'Sally');
	 *
	 *  cloned.toJSON();   //  { address: { state: 'NY' }, firstName: 'Sally' }
	 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{UnhandledError}` - Thrown for any uncaught exception.
	 *
	 * @returns {*} A new instance identical to this instance.
	 */
	clone: function () {
		try {
			return new this.constructor(this.attributes);
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
	},

	/**
	 * @doc method
	 * @id Model.instance_methods:isNew
	 * @name isNew( )
	 * @description
	 * Return `true` if this instance has not yet been saved to the database (lacks the property specified by
	 * `Model.idAttribute`, which defaults to `"id"`).
	 *
	 * Example:
	 *
	 * ```js
	 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
	 *  contact.isNew();   //  true
	 *
	 *  contact.save(function (err, contact) {
	 *      contact.toJSON();   //  { id: 45, address: { state: 'NY' }, firstName: 'John' }
	 *      contact.isNew();    //  false
	 *  });
	 *  ```
	 *
	 * @returns {boolean} Whether this instance has been saved to the database.
	 */
	isNew: function () {
		return !this.attributes[this.constructor.idAttribute];
	},

	// See reheat/lib/model/prototype/save.js
	save: require('./save'),

	// See reheat/lib/model/prototype/destroy.js
	destroy: require('./destroy'),

	/**
	 * @doc method
	 * @id Model.instance_methods:beforeValidate
	 * @name beforeValidate(cb)
	 * @summary `beforeValidate` Model lifecycle step.
	 * @description
	 * `beforeValidate` Model lifecycle step.
	 *
	 * Called immediately before `Model#validate(cb)` is called and executes in the context this instance. The
	 * default implementation does nothing. This method can be overridden via `Model.extend()`. This method should
	 * not pass anything to the callback function unless there is an error, in which case the lifecycle will be aborted
	 * with the error.
	 *
	 * Example:
	 *
	 * ```js
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
	 * ```
	 *
	 * @param {function} cb Callback function. Signature: `cb(err)`.
	 */
	beforeValidate: function (cb) {
		cb(null);
	},

	/**
	 * @doc method
	 * @id Model.instance_methods:afterValidate
	 * @name afterValidate(cb)
	 * @description
	 * `afterValidate` Model lifecycle step.
	 *
	 * Called immediately after `Model#validate(cb)` is called and executes in the context of this instance. The
	 * default implementation does nothing. This method can be overridden via `Model.extend()`. This method should
	 * not pass anything to the callback function unless there is an error, in which case the lifecycle will be aborted
	 * with the error.
	 *
	 * Example:
	 *
	 * ```js
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
	 * ```
	 *
	 * @param {function} cb Callback function. Signature: `cb(err)`.
	 */
	afterValidate: function (cb) {
		cb(null);
	},

	/**
	 * @doc method
	 * @id Model.instance_methods:validate
	 * @name validate(cb)
	 * @description
	 * Validate the current attributes of this instance against the schema of this instance's Model, if any is
	 * specified.
	 *
	 * This method does nothing if the Model of this instance does not have an instance of Schema. If this Model
	 * has an instance of Schema, the current attributes of this instance will be validated with the Schema instance.
	 * This method can be overridden for complete custom validation behavior.
	 *
	 * Example:
	 *
	 * ```js
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
	 * ```
	 *
	 * @param {function} cb Callback function. Signature: `cb(err)`. Arguments:
	 *
	 * - `{ValidationError|UnhandledError}` - `err` - `null` if no error occurs. `ValidationError` if a validation
	 * error occurs and `UnhandledError` for any other error.
	 */
	validate: function (cb) {
		var _this = this;

		if (this.constructor.schema) {
			this.constructor.schema.validate(this.attributes, function (err) {
				if (err) {
					_this.validationError = new errors.ValidationError(_this.constructor.name + '#validate(cb): Validation failed!', err);
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
	 * @doc method
	 * @id Model.instance_methods:beforeCreate
	 * @name beforeCreate(cb)
	 * @description
	 * `beforeCreate` Model lifecycle step.
	 *
	 * Called immediately before this instance is saved to the database for the first time and executes in the
	 * context of this instance. The default implementation does nothing. This method can be overridden via
	 * `Model.extend()`. This method should not pass anything to the callback function unless there is an error, in
	 * which case the lifecycle will be aborted with the error.
	 *
	 * Example:
	 *
	 * ```js
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
     * ```
     *
	 * @param {function} cb Callback function. Signature: `cb(err)`.
	 */
	beforeCreate: function (cb) {
		cb(null);
	},

	/**
	 * @doc method
	 * @id Model.instance_methods:afterCreate
	 * @name afterCreate(instance, meta, cb)
	 * @description
	 * `afterCreate` Model lifecycle step.
	 *
	 * Called immediately after this instance is saved to the database for the first time. The default
	 * implementation does nothing. This method can be overridden via `Model.extend()`. This method should pass
	 * along the instance and meta arguments to the callback function, unless there is an error, in which case the
	 * lifecycle will be aborted with the error. The inserted row is still in the database at this point, and it is
	 * currently up to the developer to remove it.
	 *
	 * Example:
	 *
	 * ```js
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
	 * ```
	 *
	 * @param {object} instance The instance of the Model.
	 * @param {object} meta Meta information about the database operation that was just performed. See
	 * [r#insert](http://rethinkdb.com/api/javascript/#insert).
	 * @param {function} cb Callback function. Signature: `cb(err, instance, meta)`. Arguments:
	 *
	 * - `{UnhandledError}` - `err` - `null` if no errors occur.
	 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `save(cb)` was called.
	 * - `{object}` - `meta` - If no error occurs, meta information about any database query that was performed.
	 */
	afterCreate: function (instance, meta, cb) {
		cb(null, instance, meta);
	},

	/**
	 * @doc method
	 * @id Model.instance_methods:beforeUpdate
	 * @name beforeUpdate(cb)
	 * @description
	 * `beforeUpdate` Model lifecycle step.
	 *
	 * Called immediately before the row specified by this instance's primary key is updated with this instance's
	 * current attributes. The default implementation does nothing. This method can be overridden via
	 * `Model.extend()`. This method should not pass anything to the callback function unless there is an error, in
	 * which case the lifecycle will be aborted with the error.
	 *
	 * Example:
	 *
	 * ```js
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
	 * ```
	 *
	 * @param {function} cb Callback function. Signature: `cb(err)`.
	 */
	beforeUpdate: function (cb) {
		cb(null);
	},

	/**
	 * @doc method
	 * @id Model.instance_methods:afterUpdate
	 * @name afterUpdate(instance, meta, cb)
	 * @description
	 * `afterUpdate` Model lifecycle step.
	 *
	 * Called immediately after the row specified by this instance's primary key is updated with this instance's
	 * current attributes and executes in the context this instance. The default implementation does nothing. This
	 * method can be overridden via `Model.extend()`. This method should pass along the instance and meta
	 * arguments to the callback function, unless there is an error, in which case the lifecycle will be aborted with
	 * the error. The row in the database has still been updated at this point, and for now it is up to the developer to
	 * roll back the changes in case of an error. The old value of the updated row is in `meta.old_val` or
	 * `this.previousAttributes`.
	 *
	 * Example:
	 *
	 * ```js
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
	 * ```
	 *
	 * @param {object} instance The instance of the Model.
	 * @param {object} meta Meta information about the database operation that was just performed. See
	 * [r#update](http://rethinkdb.com/api/javascript/#update).
	 * @param {function} cb Callback function. Signature: `cb(err, instance, meta)`. Arguments:
	 *
	 * - `{UnhandledError}` - `err` - `null` if no errors occur.
	 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `save(cb)` was called.
	 * - `{object}` - `meta` - If no error occurs, meta information about any database query that was performed.
	 */
	afterUpdate: function (instance, meta, cb) {
		cb(null, instance, meta);
	},

	/**
	 * @doc method
	 * @id Model.instance_methods:destroy
	 * @name beforeDestroy(cb)
	 * @description
	 * `beforeDestroy` Model lifecycle step.
	 *
	 * Called immediately before `Model#destroy(cb)` and executes in the context of this instance. The default
	 * implementation does nothing. This method can be overridden via `Model.extend()`. This method should not pass
	 * anything to the callback function unless there is an error, in which case the lifecycle will be aborted with the
	 * error. See [r#delete](http://rethinkdb.com/api/javascript/#delete).
	 *
	 * Example:
	 *
	 * ```js
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
	 * ```
	 *
	 * @param {function} cb Callback function. Signature: `cb(err)`.
	 */
	beforeDestroy: function (cb) {
		cb(null);
	},

	/**
	 * @doc method
	 * @id Model.instance_methods:afterDestroy
	 * @name afterDestroy(instance, meta, cb)
	 * @description
	 * `afterDestroy` Model lifecycle step.
	 *
	 * Called immediately after `Model.extend()` and executes in the context of this instance. The default
	 * implementation does nothing. This method can be overridden via `Model.extend()`. This method should pass
	 * along the instance and meta arguments to the callback function, unless there is an error, in which case the
	 * lifecycle will be aborted with the error. The row in the database has still been updated/removed at this point,
	 * and for now it is up to the developer to roll back the changes in case of an error. The old value of the updated/
	 * deleted row is in `meta.old_val` or `this.previousAttributes`.
	 *
	 * Example:
	 *
	 * ```js
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
	 * ```
	 *
	 * @param {object} instance This instance.
	 * @param {object} meta Meta information about the database operation that was just performed. See
	 * [r#delete](http://rethinkdb.com/api/javascript/#delete).
	 * @param {function} cb Callback function. Signature: `cb(err, instance, meta)`. Arguments:
	 *
	 * - `{UnhandledError}` - `err` - `null` if no errors occur.
	 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `save(cb)` was called.
	 * - `{object}` - `meta` - If no error occurs, meta information about any database query that was performed.
	 */
	afterDestroy: function (instance, meta, cb) {
		cb(null, instance, meta);
	}
};
