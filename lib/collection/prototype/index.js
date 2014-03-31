module.exports = function (utils, errors) {

	var protoProps = {

		/**
		 * @doc method
		 * @id Collection.instance_methods:initialize
		 * @name initialize( )
		 * @description
		 * Called at the end of construction of Collection instances. Used to execute custom initialization logic when
		 * creating new instances of a Collection.
		 */
		initialize: function () {
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:toJSON
		 * @name toJSON( )
		 * @description
		 * Return the plain attributes of the Model instances in this collection. Override this method to se your own
		 * custom serialization.
		 *
		 * ## Signature:
		 * ```js
		 * Collection#toJSON()
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
				var clonedArray = [];
				utils.forEach(this.models, function (model) {
					var toKeep = [];
					var clone = {};
					utils.forOwn(model.attributes, function (value, key) {
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
					clone = utils.deepMixIn(clone, utils.pick(model.attributes, toKeep));
					clonedArray.push(clone);
				});
				return clonedArray;
			} catch (err) {
				throw new errors.UnhandledError(err);
			}
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:functions
		 * @name functions( )
		 * @description
		 * Return an array of available methods on this collection instance.
		 *
		 * ## Signature:
		 * ```js
		 * Collection#functions()
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
		 * @id Collection.instance_methods:clone
		 * @name clone( )
		 * @description
		 * Clone this collection instance with its model instances.
		 *
		 * ## Signature:
		 * ```js
		 * Collection#clone()
		 * ```
		 *
		 * ## Example:
		 *
		 * ```js
		 *  contacts.toJSON();   //  [{ address: { state: 'NY' }, firstName: 'John' }]
		 *
		 *  var cloned = contacts.clone();
		 *
		 *  cloned.toJSON();   //  [{ address: { state: 'NY' }, firstName: 'John' }]
		 *  cloned.setSync('firstName', 'Sally');
		 *
		 *  cloned.toJSON();   //  [{ address: { state: 'NY' }, firstName: 'Sally' }]
		 *  contact.toJSON();   //  [{ address: { state: 'NY' }, firstName: 'John' }]
		 * ```
		 *
		 * ## Throws
		 *
		 * - `{UnhandledError}` - Thrown for any uncaught exception.
		 *
		 * @returns {*} A new collection instance identical to this collection instance, with cloned model instances as well.
		 */
		clone: function () {
			var Constructor = this.constructor;
			var models = [];
			this.forEach(function (model) {
				models.push(model.clone());
			});
			return new Constructor(models);
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:hasNew
		 * @name hasNew( )
		 * @description
		 * Return `true` if this collections contains model instances that have not yet been saved to the database
		 * (lack the property specified by `Collection.model.idAttribute`, which defaults to `"id"`).
		 *
		 * ## Signature:
		 * ```js
		 * Collection#hasNew()
		 * ```
		 *
		 * ## Example:
		 *
		 * ```js
		 *  contacts.toJSON();   //  [{ address: { state: 'NY' }, firstName: 'John' }]
		 *  contacts.hasNew();   //  true
		 *
		 *  contacts.save(function (err, contacts) {
		 *      contacts.toJSON();   //  [{ id: 45, address: { state: 'NY' }, firstName: 'John' }]
		 *      contacts.hasNew();    //  false
		 *  });
		 *  ```
		 *
		 * ## Throws
		 *
		 * - `{UnhandledError}` - Thrown for any uncaught exception.
		 *
		 * @returns {boolean} Whether this collection contains model instances that have not been saved to the database.
		 */
		hasNew: function () {
			try {
				var hasNew = false;
				this.forEach(function (model) {
					if (model.isNew()) {
						hasNew = true;
						return false;
					}
				});
				return hasNew;
			} catch (err) {
				throw new errors.UnhandledError(err);
			}
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:size
		 * @name size( )
		 * @description
		 * Return the number of model instances in this collection.
		 *
		 * ## Signature:
		 * ```js
		 * Collection#size()
		 * ```
		 *
		 * ## Example:
		 * ```js
		 * var posts = new Posts([ { author: 'John Anderson' }]);
		 *
		 * posts.size(); // 1
		 * ```
		 *
		 * @returns {number} The number of model instances in this collection.
		 */
		size: function () {
			try {
				return this.models.length;
			} catch (err) {
				throw new errors.UnhandledError(err);
			}
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:reset
		 * @name reset(models)
		 * @description
		 * Clear this collection and refill it with the given array of model instances (or array of object that will be
		 * turned into model instances).
		 *
		 * ## Signature:
		 * ```js
		 * Collection#reset(models)
		 * ```
		 *
		 * ## Example:
		 * ```js
		 * var posts = new Posts();
		 *
		 * posts.size(); // 0
		 *
		 * posts.reset([
		 *  { author: 'John Anderson', title: 'How NOT to cook' },
		 *  { author: 'Sally Johnson', title: 'How to cook' }
		 * ]);
		 *
		 * posts.size(); // 2
		 * ```
		 *
		 * ## Throws
		 *
		 * - {IllegalArgumentError} - Thrown if `models` isn't an array.
		 *
		 * @param {array} models New array of model instances for this collection.
		 */
		reset: function (models) {
			try {
				var _this = this;

				_this.models = [];
				_this.index = {};

				if (!utils.isArray(models)) {
					throw new errors.IllegalArgumentError('Collection#reset([models]): models: Must be an array!', { models: { actual: typeof models, expected: 'array' } });
				} else if (models.length) {
					utils.forEach(models, function (model) {
						if (utils.isObject(model)) {
							if (!(model instanceof _this.constructor.model)) {
								model = new _this.constructor.model(model);
							}
							var id = model.get(_this.constructor.model.idAttribute);
							if (id) {
								_this.index[id] = model;
							}
							_this.models.push(model);
						}
					});
				}
			} catch (err) {
				throw new errors.UnhandledError(err);
			}
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:getByPrimaryKey
		 * @name getByPrimaryKey(primaryKey)
		 * @description
		 * Return the model instance with the given primary key if it exists in this collection.
		 *
		 * ## Signature:
		 * ```js
		 * Collection#getByPrimaryKey(primaryKey)
		 * ```
		 *
		 * ## Example:
		 * ```js
		 *  Posts.filter({}).then(function (posts) {
		 *      posts.getByPrimaryKey('12345').get('author'); // "John Anderson"
		 *  });
		 * ```
		 *
		 * ## Throws:
		 *
		 * - {IllegalArgumentError} - Thrown if `primaryKey` isn't a string.
		 *
		 * @param {string} primaryKey The primary key of the model instance to retrieve.
		 * @returns {*} The model instance with the given primary key.
		 */
		getByPrimaryKey: function (primaryKey) {
			if (!utils.isString(primaryKey)) {
				throw new errors.IllegalArgumentError('Collection#getByPrimaryKey(primaryKey): primaryKey: Must be a string!', { primaryKey: { actual: typeof primaryKey, expected: 'string' } });
			} else {
				return this.index[primaryKey];
			}
		}
	};

	/**
	 * @doc method
	 * @id Collection.instance_methods:utility_methods
	 * @name utility_methods
	 * @description
	 * A number of utility methods are mixed into `Collection.prototype`.
	 *
	 * The following methods return a new collection with the result of the method call:
	 * - `filter`
	 * - `reject`
	 * - `shuffle`
	 * - `slice`
	 * - `sort`
	 * - `sortBy`
	 * - `unique`
	 *
	 * The following methods have various return values:
	 * - `every`
	 * - `find`
	 * - `findLast`
	 * - `findIndex`
	 * - `findLastIndex`
	 * - `forEach`
	 * - `invoke`
	 * - `map`
	 * - `pluck`
	 * - `reduce`
	 * - `remove`
	 * - `some`
	 * - `split`
	 * - `toLookup`
	 *
	 * See [mout#array](http://moutjs.com/docs/latest/array.html) for documentation of these methods.
	 */
	var methods = ['filter', 'reject', 'shuffle', 'slice', 'sort', 'sortBy', 'unique'];

	utils.forEach(methods, function (method) {
		protoProps[method] = function () {
			var args = Array.prototype.slice.call(arguments),
				Collection = this.constructor;
			args.unshift(this.models);
			return new Collection(utils[method].apply(utils, args));
		};
	});

	var methods2 = ['every', 'find', 'findLast', 'findIndex', 'findLastIndex',
		'forEach', 'invoke', 'map', 'pluck', 'reduce', 'remove', 'some', 'split', 'toLookup'];

	utils.forEach(methods2, function (method) {
		protoProps[method] = function () {
			var args = Array.prototype.slice.call(arguments);
			args.unshift(this.models);
			return utils[method].apply(utils, args);
		};
	});

	return protoProps;
};
