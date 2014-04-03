module.exports = function (container, r, Promise, utils, errors) {
	var IllegalArgumentError = errors.IllegalArgumentError,
		RuntimeError = errors.RuntimeError,
		errorPrefix = 'Model.load(relations[, options][, cb]): ';

	/**
	 * @doc method
	 * @id Model.instance_methods:load
	 * @name load
	 * @description
	 * Load specified relations of this model instance.
	 *
	 * ## Signature:
	 * ```js
	 * Model.load(relations[, options][, cb])
	 * ```
	 *
	 * ## Examples:
	 *
	 * ### Promise-style:
	 * ```js
	 *  post.load('Comment').then(function (post) {
	 *      post.get('comments'); // [...]
	 *  });
	 *
	 *  post.load(['Comment', 'User']).then(function (post) {
	 *      post.get('comments'); // [...]
	 *      post.get('user'); // {...}
	 *  });
	 * ```
	 *
	 * ### Node-style:
	 * ```js
	 *  post.load('Comment', function (err, post) {
	 *      if (err) {
	 *          // handle error
	 *      } else {
	 *         post.get('comments'); // [...]
	 *      }
	 *  });
	 * ```
	 *
	 * ## Throws/Rejects with:
	 *
	 * - `{IllegalArgumentError}`
	 * - `{UnhandledError}`
	 *
	 * @param {string|array} relations The names of the Models of the relations to load.
	 * @param {object=} options Optional configuration. Properties:
	 *
	 * - `{boolean=false}` - `profile` - If `true` the query profile will be appended to `instance.queries`.
	 *
	 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
	 *
	 * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
	 * - `{object}` - `instance` - If no error occurs, this model instance, with relations loaded.
	 * @returns {Promise} Promise.
	 */
	function load(relations, options, cb) {
		var _this = this,
			Model = _this.constructor,
			models = container.get('models');

		options = options || {};

		if (utils.isFunction(options)) {
			cb = options;
			options = {};
		}
		if (utils.isString(relations)) {
			relations = [relations];
		}

		if (cb && !utils.isFunction(cb)) {
			throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
		}

		return Promise.resolve().then(function () {

			if (!utils.isString(relations) && !utils.isArray(relations)) {
				throw new IllegalArgumentError(errorPrefix + 'relations: Must be a string or an array!', { actual: typeof relations, expected: 'string' });
			} else if (!utils.isObject(options)) {
				throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
			}

			var newModels = {},
				merge = {};

			if (Model.relations.belongsTo) {
				utils.forOwn(Model.relations.belongsTo, function (relation, modelName) {
					if (!models[modelName]) {
						throw new RuntimeError(Model.name + ' Model defined belongsTo relationship to nonexistent ' + modelName + ' Model!');
					} else if (utils.contains(relations, modelName)) {
						var localField = relation.localField,
							localKey = relation.localKey;

						merge[localField] = r.table(models[modelName].tableName).get(_this.get(localKey));

						newModels[localField] = {
							modelName: modelName,
							relation: 'belongsTo'
						};
					}
				});
			}

			if (Model.relations.hasMany) {
				utils.forOwn(Model.relations.hasMany, function (relation, modelName) {
					if (!models[modelName]) {
						throw new RuntimeError(Model.name + ' Model defined hasMany relationship to nonexistent ' + modelName + ' Model!');
					} else if (utils.contains(relations, modelName)) {
						var localField = relation.localField,
							foreignKey = relation.foreignKey;

						merge[localField] = r.table(models[modelName].tableName).getAll(_this.get(Model.idAttribute), { index: foreignKey }).coerceTo('ARRAY');

						newModels[localField] = {
							modelName: modelName,
							relation: 'hasMany'
						};
					}
				});
			}

			if (Model.relations.hasOne) {
				utils.forOwn(Model.relations.hasOne, function (relation, modelName) {
					if (!models[modelName]) {
						throw new RuntimeError(Model.name + ' Model defined hasOne relationship to nonexistent ' + modelName + ' Model!');
					} else if (utils.contains(relations, modelName)) {
						var localField = relation.localField;

						merge[localField] = r.table(models[modelName].tableName);

						if (relation.localKey) {
							merge[localField] = merge[localField].get(relation.localKey);
						} else {
							var foreignKey = relation.foreignKey;
							merge[localField] = merge[localField].getAll(_this.get(Model.idAttribute), { index: foreignKey }).coerceTo('ARRAY');
						}

						newModels[localField] = {
							modelName: modelName,
							relation: 'hasOne'
						};
					}
				});
			}

			var query = r.expr({}).merge(merge);

			return Model.tableReady
				.then(function () {
					if (!utils.isEmpty(merge)) {
						return Model.connection.run(r.table(Model.tableName).indexWait());
					} else {
						return null;
					}
				})
				.then(function () {
					return Model.connection.run(query, options).then(function (document) {
						var doc = document;
						if (options.profile) {
							doc = document.value;
						}
						if (!doc) {
							return null;
						} else {
							utils.forOwn(doc, function (localValue, localKey) {
								if (localKey in newModels) {
									if (utils.isObject(localValue)) {
										doc[localKey] = new models[newModels[localKey].modelName](doc[localKey]);
									} else if (utils.isArray(localValue)) {
										if (newModels[localKey].relation === 'hasOne' && localValue.length) {
											doc[localKey] = new models[newModels[localKey].modelName](localValue[0]);
										} else {
											doc[localKey] = new models[newModels[localKey].modelName].collection(localValue);
										}
									}
								}
							});

							_this.setSync(doc);
							if (options.profile) {
								_this.queries = _this.queries || [];
								_this.queries.push(document.profile);
							}
							return _this;
						}
					});
				});
		}).nodeify(cb);
	}

	return load;
};
