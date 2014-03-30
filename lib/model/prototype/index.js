module.exports = function (utils, errors, Model_set, Model_setSync, Model_unset, Model_clear, Model_save, Model_destroy) {

	return {

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
		 *  var Post = reheat.defineModel('Post', {
		 *      connection: new reheat.Connection(),
		 *      tableName: 'post'
		 *  }, {
		 *      initialize: function () {
		 *          this.dirty = false;
		 *      }
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
		 *  var Post = reheat.defineModel('Post', {
		 *      connection: new reheat.Connection(),
		 *      tableName: 'post'
		 *  }, {
		 *      toJSON: function () {
		 *          var attrs = this.constructor.__super__.toJSON.apply(this);
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
				var toKeep = [];
				var clone = {};
				utils.forOwn(this.attributes, function (value, key) {
					if (utils.isObject(value) && value.constructor.__reheat_super__) {
						clone[key] = value.toJSON();
					} else if (utils.isArray(value) && value.length && utils.isObject(value[0]) && value[0].constructor.__reheat_super__) {
						clone[key] = [];
						for (var i = 0; i < value.length; i++) {
							clone[key].push(value[i].toJSON());
						}
					} else {
						toKeep.push(key);
					}
				});
				clone = utils.deepMixIn(clone, utils.pick(this.attributes, toKeep));
				return clone;
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
		set: Model_set,

		// See reheat/lib/model/prototype/setSync.js
		setSync: Model_setSync,

		// See reheat/lib/model/prototype/unset.js
		unset: Model_unset,

		// See reheat/lib/model/prototype/clear.js
		clear: Model_clear,

		// See reheat/lib/model/prototype/save.js
		save: Model_save,

		// See reheat/lib/model/prototype/destroy.js
		destroy: Model_destroy,

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
				var toKeep = [];
				var clone = {};
				utils.forOwn(this.attributes, function (value, key) {
					if (utils.isObject(value) && value.constructor.__reheat_super__) {
						clone[key] = value.clone();
					} else if (utils.isArray(value) && value.length && utils.isObject(value[0]) && value[0].constructor.__reheat_super__) {
						clone[key] = [];
						for (var i = 0; i < value.length; i++) {
							clone[key].push(value[i].clone());
						}
					} else {
						toKeep.push(key);
					}
				});
				var model = new this.constructor(utils.merge({}, utils.pick(this.attributes, toKeep)));
				utils.deepMixIn(model.attributes, clone);
				return model;
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

		/**
		 * @doc method
		 * @id Model.instance_methods:beforeValidate
		 * @name beforeValidate(cb)
		 * @summary `beforeValidate` Model lifecycle step.
		 * @description
		 * `beforeValidate` Model lifecycle step.
		 *
		 * Called immediately before `Model#validate(cb)` is called and executes in the context this instance. The
		 * default implementation does nothing. This method can be overridden via `reheat.defineModel()`. This method should
		 * not pass anything to the callback function unless there is an error, in which case the lifecycle will be aborted
		 * with the error.
		 *
		 * ## Signature:
		 * ```js
		 * Model#beforeValidate(cb)
		 * ```
		 *
		 * ## Example:
		 *
		 * ```js
		 *  var Post = reheat.defineModel('Post', {
		 *      connection: new reheat.Connection(),
		 *      tableName: 'post'
		 *  }, {
	     *      beforeValidate: function (cb) {
	     *          // "this" refers to an instance of Post
	     *          if (this.get('author') === 'Walt Disney') {
	     *              cb('Impossible!');
	     *          } else {
	     *              cb();
	     *          }
	     *      }
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
		 * default implementation does nothing. This method can be overridden via `reheat.defineModel()`. This method should
		 * not pass anything to the callback function unless there is an error, in which case the lifecycle will be aborted
		 * with the error.
		 *
		 * ## Signature:
		 * ```js
		 * Model#afterValidate(cb)
		 * ```
		 *
		 * ## Example:
		 *
		 * ```js
		 *  var Post = reheat.defineModel('Post', {
		 *      connection: new reheat.Connection(),
		 *      tableName: 'post'
		 *  }, {
	     *      afterValidate: function (cb) {
	     *          // "this" refers to an instance of Post
	     *          if (this.get('author') === 'Walt Disney') {
	     *              cb('Impossible!');
	     *          } else {
	     *              cb();
	     *          }
	     *      }
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
		 * ## Signature:
		 * ```js
		 * Model#validate(cb)
		 * ```
		 *
		 * ## Example:
		 *
		 * ```js
		 *  var Post = reheat.defineModel('Post', {
		 *      connection: new reheat.Connection(),
		 *      tableName: 'post'
		 *  }, {
	     *      validate: function (cb) {
	     *          // "this" refers to an instance of Post
	     *          if (typeof this.get('author') !== 'string') {
	     *              cb('type error');
	     *          } else {
	     *              cb();
	     *          }
	     *      }
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
		 * `reheat.defineModel()`. This method should not pass anything to the callback function unless there is an error, in
		 * which case the lifecycle will be aborted with the error.
		 *
		 * ## Signature:
		 * ```js
		 * Model#beforeCreate(cb)
		 * ```
		 *
		 * ## Example:
		 *
		 * ```js
		 *  var Post = reheat.defineModel('Post', {
		 *      connection: new reheat.Connection(),
		 *      tableName: 'post'
		 *  }, {
	     *      beforeCreate: function (cb) {
	     *          // "this" refers to an instance of Post
	     *          if (this.get('author') === 'Walt Disney') {
	     *              cb('Impossible!');
	     *          } else {
	     *              cb();
	     *          }
	     *      }
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
		 * @name afterCreate(instance, cb)
		 * @description
		 * `afterCreate` Model lifecycle step.
		 *
		 * Called immediately after this instance is saved to the database for the first time. The default
		 * implementation does nothing. This method can be overridden via `reheat.defineModel()`. This method should pass
		 * along the instance argument to the callback function, unless there is an error, in which case the
		 * lifecycle will be aborted with the error. The inserted row is still in the database at this point, and it is
		 * currently up to the developer to remove it.
		 *
		 * ## Signature:
		 * ```js
		 * Model#afterCreate(instance, cb)
		 * ```
		 *
		 * ## Example:
		 *
		 * ```js
		 *  var Post = reheat.defineModel('Post', {
		 *      connection: new reheat.Connection(),
		 *      tableName: 'post'
		 *  }, {
	     *      afterCreate: function (instance, cb) {
	     *          // "this" refers to an instance of Post, and in this case, the "instance" argument is also a reference
	     *          // to "this"
	     *
	     *          // e.g. send a transactional email, log the activity, etc.
	     *
	     *          cb(null, instance);
	     *      }
	     *  });
		 * ```
		 *
		 * @param {object} instance The instance of the Model.
		 * @param {function} cb Callback function. Signature: `cb(err, instance)`. Arguments:
		 *
		 * - `{UnhandledError}` - `err` - `null` if no errors occur.
		 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `save(cb)` was called.
		 */
		afterCreate: function (instance, cb) {
			cb(null, instance);
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
		 * `reheat.defineModel()`. This method should not pass anything to the callback function unless there is an error, in
		 * which case the lifecycle will be aborted with the error.
		 *
		 * ## Signature:
		 * ```js
		 * Model#beforeUpdate(cb)
		 * ```
		 *
		 * ## Example:
		 *
		 * ```js
		 *  var Post = reheat.defineModel('Post', {
		 *      connection: new reheat.Connection(),
		 *      tableName: 'post'
		 *  }, {
	     *      beforeUpdate: function (cb) {
	     *          // "this" refers to an instance of Post
	     *          if (this.get('author') === 'Walt Disney') {
	     *              cb('Impossible!');
	     *          } else {
	     *              cb();
	     *          }
	     *      }
	     *  });
		 *
		 *  Post.get(45, function (err, post) {
	     *
	     *      post.setSync('author', 'Walt Disney');
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
		 * @name afterUpdate(instance, cb)
		 * @description
		 * `afterUpdate` Model lifecycle step.
		 *
		 * Called immediately after the row specified by this instance's primary key is updated with this instance's
		 * current attributes and executes in the context this instance. The default implementation does nothing. This
		 * method can be overridden via `reheat.defineModel()`. This method should pass along the instance
		 * argument to the callback function, unless there is an error, in which case the lifecycle will be aborted with
		 * the error. The row in the database has still been updated at this point, and for now it is up to the developer to
		 * roll back the changes in case of an error. The old value of the updated row is in `instance.meta.old_val` or
		 * `this.previousAttributes`.
		 *
		 * ## Signature:
		 * ```js
		 * Model#afterValidate(instance, cb)
		 * ```
		 *
		 * ## Example:
		 *
		 * ```js
		 *  var Post = reheat.defineModel('Post', {
		 *      connection: new reheat.Connection(),
		 *      tableName: 'post'
		 *  }, {
	     *      afterUpdate: function (instance, cb) {
	     *          // "this" refers to an instance of Post, and in this case, the "instance" argument is also a reference
	     *          // to "this"
	     *
	     *          // e.g. send a transactional email, log the activity, etc.
	     *
	     *          cb(null, instance);
	     *      }
	     *  });
		 * ```
		 *
		 * @param {object} instance The instance of the Model.
		 * @param {function} cb Callback function. Signature: `cb(err, instance)`. Arguments:
		 *
		 * - `{UnhandledError}` - `err` - `null` if no errors occur.
		 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `save(cb)` was called.
		 */
		afterUpdate: function (instance, cb) {
			cb(null, instance);
		},

		/**
		 * @doc method
		 * @id Model.instance_methods:beforeDestroy
		 * @name beforeDestroy
		 * @description
		 * `beforeDestroy` Model lifecycle step.
		 *
		 * Called immediately before `Model#destroy(cb)` and executes in the context of this instance. The default
		 * implementation does nothing. This method can be overridden via `reheat.defineModel()`. This method should not pass
		 * anything to the callback function unless there is an error, in which case the lifecycle will be aborted with the
		 * error. See [r#delete](http://rethinkdb.com/api/javascript/#delete).
		 *
		 * ## Signature:
		 * ```js
		 * Model#beforeDestroy(cb)
		 * ```js
		 *
		 * ## Example:
		 *
		 * ```js
		 *  var Post = reheat.defineModel('Post', {
		 *      connection: new reheat.Connection(),
		 *      tableName: 'post'
		 *  }, {
	     *      beforeDestroy: function (cb) {
	     *          // "this" refers to an instance of Post
	     *          if (this.get('author') === 'Walt Disney') {
	     *              cb('Impossible!');
	     *          } else {
	     *              cb();
	     *          }
	     *      }
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
		 * @name afterDestroy(instance, cb)
		 * @description
		 * `afterDestroy` Model lifecycle step.
		 *
		 * Called immediately after `reheat.defineModel()` and executes in the context of this instance. The default
		 * implementation does nothing. This method can be overridden via `reheat.defineModel()`. This method should pass
		 * along the instance argument to the callback function, unless there is an error, in which case the
		 * lifecycle will be aborted with the error. The row in the database has still been updated/removed at this point,
		 * and for now it is up to the developer to roll back the changes in case of an error. The old value of the updated/
		 * deleted row is in `instance.meta.old_val` or `this.previousAttributes`.
		 *
		 * ## Signature:
		 * ```js
		 * Model#afterDestroy(instance, cb)
		 * ```
		 *
		 * ## Example:
		 *
		 * ```js
		 *  var Post = reheat.defineModel('Post', {
		 *      connection: new reheat.Connection(),
		 *      tableName: 'post'
		 *  }, {
	     *      afterDestroy: function (instance, cb) {
	     *          // "this" refers to an instance of Post, and in this case, the "instance" argument is also a reference
	     *          // to "this"
	     *
	     *          // e.g. send a transactional email, log the activity, etc.
	     *
	     *          cb(null, instance);
	     *      }
	     *  });
		 * ```
		 *
		 * @param {object} instance This instance.
		 * @param {function} cb Callback function. Signature: `cb(err, instance)`. Arguments:
		 *
		 * - `{UnhandledError}` - `err` - `null` if no errors occur.
		 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `save(cb)` was called.
		 */
		afterDestroy: function (instance, cb) {
			cb(null, instance);
		}
	};
};
