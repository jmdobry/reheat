/* jshint loopfunc:true */
module.exports = function (container, r, Promise, utils, errors) {

	var errorPrefix = 'Collection.filter(predicate[, options][, cb]): ',
		IllegalArgumentError = errors.IllegalArgumentError,
		RuntimeError = errors.RuntimeError,
		UnhandledError = errors.UnhandledError;

	function _filter(predicate, options) {
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

		return Promise.resolve().then(function _filterInner() {

			if (!('withDeleted' in options)) {
				options.withDeleted = false;
			}

			if (!utils.isEmpty(predicate.where)) {
				query = query.filter(predicate.where);
			}

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

			if (predicate.orderBy) {
				if (utils.isString(predicate.orderBy)) {
					predicate.orderBy = [
						[predicate.orderBy, 'asc']
					];
				}
				for (var i = 0; i < predicate.orderBy.length; i++) {
					if (utils.isString(predicate.orderBy[i])) {
						predicate.orderBy[i] = [predicate.orderBy[i], 'asc'];
					}
					query = utils.upperCase(predicate.orderBy[i][1]) === 'DESC' ? query.orderBy(r.desc(predicate.orderBy[i][0])) : query.orderBy(predicate.orderBy[i][0]);
				}
			}

			if (predicate.limit) {
				query = query.limit(predicate.limit);
			}

			if (predicate.skip) {
				query = query.skip(predicate.skip);
			}

			if (predicate.pluck) {
				if (utils.isString(predicate.pluck)) {
					query = query.pluck(predicate.pluck);
				} else {
					query = query.pluck.apply(query, predicate.pluck);
				}
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
		});
	}

	/**
	 * @doc method
	 * @id Collection.static_methods:filter
	 * @name filter
	 * @description
	 * Filter `Collection.model.tableName` by the given predicate. Return a collection of instances of Colleciton.model or
	 * the raw data if `options.raw === true`.
	 *
	 * See [r#filter](http://rethinkdb.com/api/javascript/#filter).
	 *
	 * ## Signature:
	 * ```js
	 * Collection.filter(predicate[, options][, cb])
	 * ```
	 *
	 * ## Examples:
	 *
	 * ### Promise-style:
	 * ```js
	 *  Posts.filter({
	 *      where: {
	 *          author: 'John Anderson'
	 *      }
	 *  }).then(function (posts) {
	 *      res.send(200, posts.toJSON());
	 *  })
	 *  .catch(reheat.support.IllegalArgumentError, function (err) {
	 *      res.send(400, err.errors);
	 *  })
	 *  .catch(reheat.support.UnhandledError, function (err) {
	 *      res.send(500, err.message);
	 *  })
	 *  .error(function (err) {
	 *      res.send(500, err.message);
	 *  });
	 * ```
	 *
	 * ### Node-style:
	 * ```js
	 *  Posts.filter({
	 *      where: {
	 *          author: 'John Anderson'
	 *      }
	 *  }, function (err, posts) {
	 *      if (err) {
	 *          if (err instanceof reheat.support.IllegalArgumentError) {
	 *              res.send(400, err.errors);
	 *          } else {
	 *              res.send(500, err.message);
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
	 * @param {object} predicate Filtering criteria. Properties:
	 *
	 * - `{object=}` - `where` - Where clause.
	 * - `{string|array.<string>=}` - `orderBy` - OrderBy clause.
	 * - `{number=}` - `limit` - Limit clause.
	 * - `{number=}` - `skip` - Skip clause.
	 * - `{string|array=}` - `pluck` - Pluck clause. Only applies if `options.raw` === true.
	 *
	 * @param {object=} options Optional configuration. Properties:
	 *
	 * - `{boolean=false}` - `raw`- If `true`, return the raw data instead of instances of Model.
	 * - `{boolean=false}` - `withDeleted`- If `true`, return "softDeleted" items as well.
	 * - `{array=[]}` - `with`- Array of strings corresponding to the Model names of relations to retrieve and merge into
	 * the result.
	 *
	 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, collection)`. Arguments:
	 *
	 * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
	 * - `{Collection}` - `collection` - If no error occurs, an instance of this Collection filled with instances of this
	 * Collection's Model.
	 * @returns {Promise} Promise.
	 */
	function filter(predicate, options, cb) {
		var _this = this;

		options = options || {};

		if (utils.isFunction(options)) {
			cb = options;
			options = {};
		}

		if (cb && !utils.isFunction(cb)) {
			throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
		}

		return Promise.resolve().then(function sanitize() {

			if (!utils.isObject(predicate)) {
				throw new IllegalArgumentError(errorPrefix + 'predicate: Must be an object!', { actual: typeof predicate, expected: 'object' });
			} else if (!utils.isObject(options)) {
				throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
			}

			predicate.where = predicate.where || {};

			if (utils.isString(predicate.where)) {
				try {
					predicate.where = JSON.parse(predicate.where);
				} catch (err) {
					throw new UnhandledError(err);
				}
			} else if (!utils.isObject(predicate.where)) {
				throw new IllegalArgumentError(errorPrefix + 'predicate.where: Must be a string or an object!', { where: { actual: typeof predicate.where, expected: 'string|object' } });
			}

			if (predicate.limit) {
				var limit = parseInt(predicate.limit, 10);
				if (isNaN(limit)) {
					throw new IllegalArgumentError(errorPrefix + 'predicate.limit: Must be a number!', { limit: { actual: typeof predicate.limit, expected: 'number' } });
				} else {
					predicate.limit = limit;
				}
			}

			if (predicate.skip) {
				var skip = parseInt(predicate.skip, 10);
				if (isNaN(skip)) {
					throw new IllegalArgumentError(errorPrefix + 'predicate.skip: Must be a number!', { skip: { actual: typeof predicate.skip, expected: 'number' } });
				} else {
					predicate.skip = skip;
				}
			}

			if (predicate.pluck && options.raw) {
				if (!utils.isString(predicate.pluck) && !utils.isArray(predicate.pluck)) {
					throw new IllegalArgumentError(errorPrefix + 'predicate.pluck: Must be a string or an array!', { pluck: { actual: typeof predicate.pluck, expected: 'string|array' } });
				}
			} else {
				delete predicate.pluck;
			}

			return _filter.apply(_this, [predicate, options, cb]);
		}).nodeify(cb);
	}

	return filter;
};
