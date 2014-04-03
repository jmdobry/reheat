module.exports = function (Collection_save, utils, errors, Promise) {

	var protoProps = {

		/**
		 * @doc method
		 * @id Collection.instance_methods:initialize
		 * @name initialize
		 * @description
		 * Called at the end of construction of Collection instances. Used to execute custom initialization logic when
		 * creating new instances of a Collection.
		 */
		initialize: function () {
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:toJSON
		 * @name toJSON
		 * @description
		 * Return the plain attributes of the Model instances in this collection. Override this method to se your own
		 * custom serialization.
		 *
		 * ## Signature:
		 * ```js
		 * Collection#toJSON()
		 * ```
		 *
		 * ## Throws:
		 *
		 * - `{UnhandledError}` - Thrown for any uncaught exception.
		 *
		 * @returns {object} The plain attributes of this instance.
		 *
		 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L20).
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
		 * @name functions
		 * @description
		 * Return an array of available methods on this collection instance.
		 *
		 * ## Signature:
		 * ```js
		 * Collection#functions()
		 * ```
		 *
		 * ## Throws:
		 *
		 * - `{UnhandledError}` - Thrown for any uncaught exception.
		 *
		 * @returns {array} Array of available functions on this instance.
		 *
		 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L51).
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
		 * @id Collection.instance_methods:destroy
		 * @name destroy
		 * @description
		 * Call `destroy()` on every model instance in this collection. Not very efficient. When destroyed, each model
		 * instance will run through its model lifecycle (`beforeDestroy` and `afterDestroy`).
		 *
		 * ## Signature:
		 * ```js
		 * Collection#destroy([options][, cb])
		 * ```
		 *
		 * ## Throws/Rejects with
		 *
		 * - `{IllegalArgumentError}`
		 * - `{UnhandledError}`
		 *
		 * @param {object=} options Optional configuration options. Properties:
		 *
		 * - `{boolean=false}` - `deepDestroy` - If `true`, call `destroy()` on any hasOne or hasMany relations currently
		 * loaded into each model instance.
		 *
		 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
		 *
		 * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
		 * - `{object}` - `instance` - If no error occurs, a reference to the collection instance on which `destroy(cb)` was called.
		 * @returns {Promise} Promise.
		 */
		destroy: function (options, cb) {
			var tasks = [],
				_this = this;

			if (utils.isFunction(options)) {
				cb = options;
				options = {};
			}

			this.forEach(function (instance) {
				tasks.push(instance.destroy(options, cb));
			});

			return Promise.all(tasks)
				.then(function () {
					return _this;
				})
				.nodeify(cb);
		},

		save: Collection_save,

		/**
		 * @doc method
		 * @id Collection.instance_methods:clone
		 * @name clone
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
		 * ## Throws:
		 *
		 * - `{UnhandledError}` - Thrown for any uncaught exception.
		 *
		 * @returns {*} A new collection instance identical to this collection instance, with cloned model instances as well.
		 *
		 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L89).
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
		 * @name hasNew
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
		 * ## Throws:
		 *
		 * - `{UnhandledError}` - Thrown for any uncaught exception.
		 *
		 * @returns {boolean} Whether this collection contains model instances that have not been saved to the database.
		 *
		 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L134).
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
		 * @name size
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
		 *
		 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L200).
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
		 * @name reset
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
		 * ## Throws:
		 *
		 * - {IllegalArgumentError} - Thrown if `models` isn't an array.
		 *
		 * @param {array} models New array of model instances for this collection.
		 *
		 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L212).
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
		 * @name getByPrimaryKey
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
		 *  Posts.findAll({}).then(function (posts) {
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
		 *
		 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L166).
		 */
		getByPrimaryKey: function (primaryKey) {
			if (!utils.isString(primaryKey)) {
				throw new errors.IllegalArgumentError('Collection#getByPrimaryKey(primaryKey): primaryKey: Must be a string!', { primaryKey: { actual: typeof primaryKey, expected: 'string' } });
			} else {
				return this.index[primaryKey];
			}
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:removeByPrimaryKey
		 * @name removeByPrimaryKey
		 * @description
		 * Return the model instance with the given primary key if it exists in this collection.
		 *
		 * ## Signature:
		 * ```js
		 * Collection#removeByPrimaryKey(primaryKey)
		 * ```
		 *
		 * ## Example:
		 * ```js
		 *  Posts.findAll({}).then(function (posts) {
		 *      posts.size(); // 5
		 *      posts.removeByPrimaryKey('12345').get('author'); // "John Anderson"
		 *      posts.size(); // 4
		 *  });
		 * ```
		 *
		 * ## Throws:
		 *
		 * - {IllegalArgumentError} - Thrown if `primaryKey` isn't a string.
		 *
		 * @param {string} primaryKey The primary key of the model instance to remove.
		 * @returns {*} The model instance with the given primary key.
		 *
		 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L166).
		 */
		removeByPrimaryKey: function (primaryKey) {
			if (!utils.isString(primaryKey)) {
				throw new errors.IllegalArgumentError('Collection#removeByPrimaryKey(primaryKey): primaryKey: Must be a string!', { primaryKey: { actual: typeof primaryKey, expected: 'string' } });
			} else {
				var toRemove = this.index[primaryKey];
				if (toRemove) {
					utils.remove(this.models, toRemove);
				}
				delete this.index[primaryKey];
				return toRemove;
			}
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:pluck
		 * @name pluck
		 * @description
		 * See [mout.array.pluck](http://moutjs.com/docs/latest/array.html#pluck).
		 *
		 * ## Signature:
		 * ```js
		 * Collection#pluck(propName)
		 * ```
		 *
		 * ## Example:
		 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L652).
		 */
		pluck: function (propName) {
			return utils.pluck(this.toJSON(), propName);
		}
	};

	/**
	 * @doc method
	 * @id Collection.instance_methods:filter
	 * @name filter
	 * @description
	 * See [mout.array.filter](http://moutjs.com/docs/latest/array.html#filter).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#filter(callback, [thisObj])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L237).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:map
	 * @name map
	 * @description
	 * See [mout.array.map](http://moutjs.com/docs/latest/array.html#map).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#map(callback, [thisObj])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L621).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:reject
	 * @name reject
	 * @description
	 * See [mout.array.reject](http://moutjs.com/docs/latest/array.html#reject).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#reject(callback, [thisObj])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L261).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:shuffle
	 * @name shuffle
	 * @description
	 * See [mout.array.shuffle](http://moutjs.com/docs/latest/array.html#shuffle).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#shuffle()
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L285).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:slice
	 * @name slice
	 * @description
	 * See [mout.array.slice](http://moutjs.com/docs/latest/array.html#slice).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#slice([start][, end])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L315).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:sort
	 * @name sort
	 * @description
	 * See [mout.array.sort](http://moutjs.com/docs/latest/array.html#sort).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#sort([compareFunc])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L343).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:sortBy
	 * @name sortBy
	 * @description
	 * See [mout.array.sortBy](http://moutjs.com/docs/latest/array.html#sortBy).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#sortBy(callback[, context])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L384).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:unique
	 * @name unique
	 * @description
	 * See [mout.array.unique](http://moutjs.com/docs/latest/array.html#unique).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#unique([compare])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L425).
	 */
	var methods = ['filter', 'map', 'reject', 'shuffle', 'slice', 'sort', 'sortBy', 'unique'];

	utils.forEach(methods, function (method) {
		protoProps[method] = function () {
			var args = Array.prototype.slice.call(arguments),
				Collection = this.constructor;
			args.unshift(this.models);
			return new Collection(utils[method].apply(utils, args));
		};
	});

	/**
	 * @doc method
	 * @id Collection.instance_methods:every
	 * @name every
	 * @description
	 * See [mout.array.every](http://moutjs.com/docs/latest/array.html#every).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#every(callback[, thisObj])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L479).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:find
	 * @name find
	 * @description
	 * See [mout.array.find](http://moutjs.com/docs/latest/array.html#find).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#find(callback[, thisObj])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L496).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:findLast
	 * @name findLast
	 * @description
	 * See [mout.array.findLast](http://moutjs.com/docs/latest/array.html#findLast).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#findLast(callback[, thisObj])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L519).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:findIndex
	 * @name findIndex
	 * @description
	 * See [mout.array.findIndex](http://moutjs.com/docs/latest/array.html#findIndex).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#findIndex(iterator[, thisObj])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L542).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:findLastIndex
	 * @name findLastIndex
	 * @description
	 * See [mout.array.findLastIndex](http://moutjs.com/docs/latest/array.html#findLastIndex).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#findLastIndex(iterator[, thisObj])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L565).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:forEach
	 * @name forEach
	 * @description
	 * See [mout.array.forEach](http://moutjs.com/docs/latest/array.html#forEach).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#forEach(callback[, thisObj])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L588).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:invoke
	 * @name invoke
	 * @description
	 * See [mout.array.invoke](http://moutjs.com/docs/latest/array.html#invoke).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#invoke(methodName[, args...])
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L605).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:reduce
	 * @name reduce
	 * @description
	 * See [mout.array.reduce](http://moutjs.com/docs/latest/array.html#reduce).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#reduce(accumulatorFunc)
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L673).
	 */
	/**
	 * @doc method
	 * @id Collection.instance_methods:split
	 * @name split
	 * @description
	 * See [mout.array.split](http://moutjs.com/docs/latest/array.html#split).
	 *
	 * ## Signature:
	 * ```js
	 * Collection#split(accumulatorFunc)
	 * ```
	 *
	 * ## Example:
	 * See [the test](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/prototype/index.test.js#L706).
	 */
	methods = ['every', 'find', 'findLast', 'findIndex', 'findLastIndex',
		'forEach', 'invoke', 'reduce', 'remove', 'some', 'split'];

	utils.forEach(methods, function (method) {
		protoProps[method] = function () {
			var args = Array.prototype.slice.call(arguments);
			args.unshift(this.models);
			return utils[method].apply(utils, args);
		};
	});

	return protoProps;
};
