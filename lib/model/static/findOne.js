var errorPrefix = 'Model.findOne(primaryKey[, options][, cb]): ';

module.exports = function (container, r, Promise, utils, errors) {
	/**
	 * @doc method
	 * @id Model.static_methods:findOne
	 * @name findOne
	 * @description
	 * Search the table specified by `Model.tableName` for the document with the given primary key. Return an instance of
	 * this Model or the raw data if `options.raw === true`.
	 *
	 * See [r#get](http://rethinkdb.com/api/javascript/#get).
	 *
	 * ## Signature:
	 * ```js
	 * Model.findOne(primaryKey[, options][, cb])
	 * ```
	 *
	 * ## Examples:
	 *
	 * ### Promise-style:
	 * ```js
	 *  Post.findOne('325d2b12-e412-4e0e-be28-c87173f45374').then(function (post) {
	 *      if (post) {
	 *          res.send(200, post.toJSON());
	 *      } else {
	 *          res.send(404);
	 *      }
	 *  })
	 *  .catch(reheat.support.IllegalArgumentError, function (err) {
	 *      res.send(400, err.errors);
	 *  })
	 *  .error(function (err) {
	 *      res.send(500, 'Internal Server Error!');
	 *  });
	 * ```
	 *
	 * ### Node-style:
	 * ```js
	 *  Post.findOne('325d2b12-e412-4e0e-be28-c87173f45374', function (err, post) {
	 *      if (err) {
	 *          if (err instanceof reheat.support.IllegalArgumentError) {
	 *              res.send(400, err.errors);
	 *          } else {
	 *              res.send(500, 'Internal Server Error!');
	 *          }
	 *      } else {
	 *          if (post) {
	 *              res.send(200, post.toJSON());
	 *          } else {
	 *              res.send(404);
	 *          }
	 *      }
	 *  });
	 * ```
	 *
	 * ## Throws/Rejects with:
	 *
	 * - `{IllegalArgumentError}`
	 * - `{UnhandledError}`
	 *
	 * @param {string} primaryKey The primary key of the document to retrieve.
	 * @param {object=} options Optional configuration. Properties:
	 *
	 * - `{boolean=false}` - `raw` - If `true`, return the raw data instead of an instance of Model.
	 * - `{boolean=false}` - `profile` - If `true` the query profile will be appended to `instance.queries`.
	 * - `{array=[]}` - `with` - Array of strings corresponding to the Model names of relations to retrieve an merge into
	 * the result.
	 *
	 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
	 *
	 * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
	 * - `{object}` - `instance` - If no error occurs this model instance.
	 * @returns {Promise} Promise.
	 */
	function findOne(primaryKey, options, cb) {
		var models = container.get('models'),
			newModels = {},
			merge = {},
			query,
			Model = this;

		if (utils.isFunction(options)) {
			cb = options;
			options = {};
		}
		options = options || {};
		if (cb && !utils.isFunction(cb)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
		}
		return Promise.resolve().bind(this)
			.then(function () {
				if (!utils.isString(primaryKey)) {
					throw new errors.IllegalArgumentError(errorPrefix + 'primaryKey: Must be a string!', { actual: typeof primaryKey, expected: 'string' });
				} else if (!utils.isObject(options)) {
					throw new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
				} else if (options.with && !utils.isArray(options.with)) {
					throw new errors.IllegalArgumentError(errorPrefix + 'options.with: Must be an array!', { actual: typeof options.with, expected: 'array' });
				}

				query = r.do(r.table(Model.tableName).get(primaryKey), function (doc) {
					if (options.with) {
						if (Model.relations.belongsTo) {
							utils.forOwn(Model.relations.belongsTo, function (relation, modelName) {
								if (!models[modelName]) {
									throw new errors.RuntimeError(Model.name + ' Model defined belongsTo relationship to nonexistent ' + modelName + ' Model!');
								} else if (utils.contains(options.with, modelName)) {
									var localField = relation.localField,
										localKey = relation.localKey;

									merge[localField] = r.table(models[modelName].tableName).get(doc(localKey).default(''));

									newModels[localField] = {
										modelName: modelName,
										relation: 'belongsTo'
									};
								}
							}, Model);
						}

						if (Model.relations.hasMany) {
							utils.forOwn(Model.relations.hasMany, function (relation, modelName) {
								if (!models[modelName]) {
									throw new errors.RuntimeError(Model.name + ' Model defined hasMany relationship to nonexistent ' + modelName + ' Model!');
								} else if (utils.contains(options.with, modelName)) {
									var localField = relation.localField,
										foreignKey = relation.foreignKey;

									merge[localField] = r.table(models[modelName].tableName).getAll(primaryKey, { index: foreignKey }).coerceTo('ARRAY');

									newModels[localField] = {
										modelName: modelName,
										relation: 'hasMany'
									};
								}
							}, Model);
						}

						if (Model.relations.hasOne) {
							utils.forOwn(Model.relations.hasOne, function (relation, modelName) {
								if (!models[modelName]) {
									throw new errors.RuntimeError(Model.name + ' Model defined hasOne relationship to nonexistent ' + modelName + ' Model!');
								} else if (utils.contains(options.with, modelName)) {
									var localField = relation.localField;

									merge[localField] = r.table(models[modelName].tableName);

									if (relation.localKey) {
										merge[localField] = merge[localField].get(relation.localKey);
									} else {
										var foreignKey = relation.foreignKey;
										merge[localField] = merge[localField].getAll(primaryKey, { index: foreignKey }).coerceTo('ARRAY');
									}

									newModels[localField] = {
										modelName: modelName,
										relation: 'hasOne'
									};
								}
							}, Model);
						}

						if (!utils.isEmpty(merge)) {
							return doc.merge(merge);
						}
					}
					return doc;
				});
			})
			.then(function () {
				if (this.tableReady && this.tableReady !== true) {
					return this.tableReady;
				}
			})
			.then(function () {
				if (!utils.isEmpty(merge)) {
					return this.connection.run(r.table(this.tableName).indexWait());
				} else {
					return null;
				}
			})
			.then(function () {
				return this.connection.run(query, options).then(function (document) {
					var doc = document;
					if (options.profile) {
						doc = document.value;
					}
					if (!doc) {
						return null;
					} else {
						if (!options.raw) {
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
							var modelDoc = new Model(doc);
							if (options.profile) {
								modelDoc.queries = [document.profile];
							}
							return modelDoc;
						} else {
							return doc;
						}
					}
				});
			})
			.finally(function () {
				models = newModels = merge = query = Model = null;
			}).nodeify(cb);
	}

	return findOne;
};
