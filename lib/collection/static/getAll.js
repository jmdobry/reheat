/* jshint loopfunc:true */
module.exports = function (container, r, Promise, utils, errors) {
	var errorPrefix = 'Collection.getAll(keys, index[, options][, cb]): ',
		IllegalArgumentError = errors.IllegalArgumentError,
		RuntimeError = errors.RuntimeError;

	/**
	 * @doc method
	 * @id Collection.static_methods:getAll
	 * @name getAll
	 * @description
	 * Search the table specified by `Collection.model.tableName` by the specified index for the documents with the given keys. Return
	 * a collection of instances of `Collection.model` or the raw data if `options.raw === true`.
	 *
	 *  See [r#filter](http://rethinkdb.com/api/javascript/#filter).
	 *
	 * ## Signature:
	 * ```js
	 * Collection.getAll(keys, index[, options][, cb])
	 * ```
	 *
	 * ## Examples:
	 *
	 * ### Promise-style:
	 * ```js
	 *  Posts.getAll('John Anderson', { index: 'author' }).then(function (posts) {
	 *      res.send(200, posts.toJSON());
	 *  })
	 *  .catch(reheat.support.IllegalArgumentError, function (err) {
	 *      res.send(400, err.errors);
	 *  })
	 *  .error(function (err) {
	 *      res.send(500, err.message);
	 *  });
	 * ```
	 *
	 * ### Node-style:
	 * ```js
	 *  Posts.getAll('John Anderson', { index: 'author' }, function (err, posts) {
	 *      if (err) {
	 *          if (err instanceof reheat.support.IllegalArgumentError) {
	 *              res.send(400, err.errors);
	 *          } else {
	 *              res.send(500, 'Internal Server Error!');
	 *          }
	 *      } else {
	 *          res.send(200, posts.toJSON());
	 *      }
	 *  });
	 * ```
	 *
	 * ## Throws/Rejects with
	 *
	 * - `{IllegalArgumentError}`
	 * - `{UnhandledError}`
	 *
	 * @param {string|array} keys A single key as a string, or an array of keys.
	 * @param {string|object} index The name of the secondary index by which to search for `keys`.
	 * @param {object=} options Optional configuration. Properties:
	 *
	 * - `{boolean=false}` - `raw`- If `true`, return the raw data instead of a collection and model instances.
	 * - `{boolean=false}` - `withDeleted`- If `true`, return "softDeleted" items as well.
	 * - `{boolean=false}` - `profile`- If `true` the query profile will be appended to `instance.queries`.
	 *
	 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instances)`. Arguments:
	 *
	 * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
	 * - `{object}` - `collection` - If no error occurs, a collection instance.
	 * @returns {Promise} Promise.
	 */
	function getAll(keys, index, options, cb) {
		var Collection = this,
			models = container.get('models'),
			Model;

		if (this.model) {
			Model = this.model;
		} else if (this.collection) {
			Model = this;
			Collection = Model.collection;
		}

		var query = r.table(Model.tableName);

		options = options || {};

		if (utils.isFunction(options)) {
			cb = options;
			options = {};
		}
		if (utils.isString(keys)) {
			keys = [keys];
		}
		if (utils.isString(index)) {
			index = {
				index: index
			};
		}
		if (cb && !utils.isFunction(cb)) {
			throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
		}

		return Promise.resolve().then(function sanitize() {
			if (!utils.isArray(keys)) {
				throw new IllegalArgumentError(errorPrefix + 'keys: Must be a string or an array!', { actual: typeof keys, expected: 'string|array' });
			} else if (!utils.isString(index) && !utils.isObject(index)) {
				throw new IllegalArgumentError(errorPrefix + 'index: Must be a string or an object!', { actual: typeof index, expected: 'string|object' });
			} else if (!utils.isObject(options)) {
				throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
			}

			if (!('withDeleted' in options)) {
				options.withDeleted = false;
			}

			keys.push(index);

			query = query.getAll.apply(query, keys);

			if (Model.softDelete && !options.withDeleted) {
				query = query.filter({ deleted: null });
			}

			var newModels = {},
				merge = {};

			if (options.with && options.with.length) {
				query = query.map(function (doc) {
					if (Model.relations.belongsTo) {
						utils.forOwn(Model.relations.belongsTo, function (relation, modelName) {
							if (!models[modelName]) {
								throw new RuntimeError(Model.name + ' Model defined belongsTo relationship to nonexistent ' + modelName + ' Model!');
							} else if (utils.contains(options.with, modelName)) {
								var localField = relation.localField,
									localKey = relation.localKey;

								merge[localField] = r.table(models[modelName].tableName).get(doc(localKey));

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
							} else if (utils.contains(options.with, modelName)) {
								var localField = relation.localField,
									foreignKey = relation.foreignKey;

								merge[localField] = r.table(models[modelName].tableName).getAll(doc(Model.idAttribute), { index: foreignKey }).coerceTo('ARRAY');

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
							} else if (utils.contains(options.with, modelName)) {
								var localField = relation.localField;

								merge[localField] = r.table(models[modelName].tableName);

								if (relation.localKey) {
									merge[localField] = merge[localField].get(relation.localKey);
								} else {
									var foreignKey = relation.foreignKey;
									merge[localField] = merge[localField].getAll(doc(Model.idAttribute), { index: foreignKey }).coerceTo('ARRAY');
								}

								newModels[localField] = {
									modelName: modelName,
									relation: 'hasOne'
								};
							}
						});
					}

					return doc.merge(merge);
				});
			}

			return Model.connection.run(query, options).then(function (cursor) {
				var deferred = Promise.defer(),
					profile;

				if (options.profile) {
					profile = cursor.profile;
					cursor = cursor.value;
				}

				cursor.toArray(function (err, documents) {
					if (err) {
						deferred.reject(err);
					} else {
						if (!options.raw) {
							var length = documents.length;
							for (var i = 0; i < length; i++) {
								var doc = documents[i];
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
								documents[i] = new Model(documents[i]);
							}
						}
						var collection = new Collection(documents);
						if (options.profile) {
							collection.queries = [profile];
						}
						deferred.resolve(collection);
					}
				});

				return deferred.promise;
			});
		}).nodeify(cb);
	}

	return getAll;
};
