module.exports = function (container, r, Promise, utils, errors) {
	var IllegalArgumentError = errors.IllegalArgumentError,
		RuntimeError = errors.RuntimeError,
		errorPrefix = 'Model.load(relations[, options][, cb]): ';

	/**
	 * @doc method
	 * @id Model.instance_methods:load
	 * @name load
	 * @description
	 * Load the specified relations of this model instance.
	 *
	 * ## Signature:
	 * ```js
	 * Model#load(relations[, options][, cb])
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
		var models = container.get('models'),
			newModels = {},
			merge = {},
			query;

		return Promise.resolve().bind(this)
			.then(function () {
				if (utils.isFunction(options)) {
					cb = options;
					options = {};
				}
				options = options || {};
				if (utils.isString(relations)) {
					relations = [relations];
				}
				if (cb && !utils.isFunction(cb)) {
					throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
				} else if (!utils.isString(relations) && !utils.isArray(relations)) {
					throw new IllegalArgumentError(errorPrefix + 'relations: Must be a string or an array!', { actual: typeof relations, expected: 'string' });
				} else if (!utils.isObject(options)) {
					throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
				}
			})
			.then(function () {

				if (this.constructor.relations.belongsTo) {
					utils.forOwn(this.constructor.relations.belongsTo, function (relation, modelName) {
						if (!models[modelName]) {
							throw new RuntimeError(this.constructor.name + ' Model defined belongsTo relationship to nonexistent ' + modelName + ' Model!');
						} else if (utils.contains(relations, modelName)) {
							var localField = relation.localField,
								localKey = relation.localKey;

							merge[localField] = r.table(models[modelName].tableName).get(this.get(localKey) || '');

							newModels[localField] = {
								modelName: modelName,
								relation: 'belongsTo'
							};
						}
					}, this);
				}

				if (this.constructor.relations.hasMany) {
					utils.forOwn(this.constructor.relations.hasMany, function (relation, modelName) {
						if (!models[modelName]) {
							throw new RuntimeError(this.constructor.name + ' Model defined hasMany relationship to nonexistent ' + modelName + ' Model!');
						} else if (utils.contains(relations, modelName)) {
							var localField = relation.localField,
								foreignKey = relation.foreignKey;

							merge[localField] = r.table(models[modelName].tableName).getAll(this.get(this.constructor.idAttribute) || '', { index: foreignKey }).coerceTo('ARRAY');

							newModels[localField] = {
								modelName: modelName,
								relation: 'hasMany'
							};
						}
					}, this);
				}

				if (this.constructor.relations.hasOne) {
					utils.forOwn(this.constructor.relations.hasOne, function (relation, modelName) {
						if (!models[modelName]) {
							throw new RuntimeError(this.constructor.name + ' Model defined hasOne relationship to nonexistent ' + modelName + ' Model!');
						} else if (utils.contains(relations, modelName)) {
							var localField = relation.localField;

							merge[localField] = r.table(models[modelName].tableName);

							if (relation.localKey) {
								merge[localField] = merge[localField].get(relation.localKey);
							} else {
								var foreignKey = relation.foreignKey;
								merge[localField] = merge[localField].getAll(this.get(this.constructor.idAttribute) || '', { index: foreignKey }).coerceTo('ARRAY');
							}

							newModels[localField] = {
								modelName: modelName,
								relation: 'hasOne'
							};
						}
					}, this);
				}

				query = r.expr({}).merge(merge);

				if (this.constructor.tableReady && this.constructor.tableReady !== true) {
					return this.constructor.tableReady;
				}
			})
			.then(function () {
				if (!utils.isEmpty(merge)) {
					return this.constructor.connection.run(r.table(this.constructor.tableName).indexWait());
				} else {
					return null;
				}
			})
			.then(function () {
				return this.constructor.connection.run(query, options);
			})
			.then(function (document) {
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

					this.setSync(doc);
					if (options.profile) {
						this.queries = this.queries || [];
						this.queries.push(document.profile);
					}
					return this;
				}
			})
			.finally(function () {
				models = newModels = merge = query = null;
			}).nodeify(cb);
	}

	return load;
}
;
