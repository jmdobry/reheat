var errorPrefix = 'Collection.getAll(keys, index[, options][, cb]): ';

module.exports = function (r, Promise, utils, errors, extend, collections) {
	var IllegalArgumentError = errors.IllegalArgumentError;

	/**
	 * @doc method
	 * @id Model.static_methods:getAll
	 * @name getAll
	 * @description
	 * Search the table specified by `Model.tableName` by the specified index for the documents with the given keys. Return
	 * a collection of instances of this Model or the raw data if `options.raw === true`.
	 *
	 *  See [r#filter](http://rethinkdb.com/api/javascript/#filter).
	 *
	 * ## Signature:
	 * ```js
	 * Model.getAll(keys, index[, options][, cb])
	 * ```
	 *
	 * ## Examples:
	 *
	 * ### Promise-style:
	 * ```js
	 *  Post.getAll('John Anderson', { index: 'author' }).then(function (posts) {
	 *      // Express will automatically .toJSON() each of these posts
	 *      res.send(200, posts);
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
	 *  Post.getAll('John Anderson', { index: 'author' }, function (err, posts) {
	 *      if (err) {
	 *          if (err instanceof reheat.support.IllegalArgumentError) {
	 *              res.send(400, err.errors);
	 *          } else {
	 *              res.send(500, 'Internal Server Error!');
	 *          }
	 *      } else {
	 *          // Express will automatically .toJSON() each of these posts
	 *          res.send(200, posts);
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
	 * - `{boolean=false}` - `raw`- If `true`, return the raw data instead of instances of Model.
	 * - `{boolean=false}` - `withDeleted`- If `true`, return "softDeleted" items as well.
	 *
	 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instances)`. Arguments:
	 *
	 * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
	 * - `{object}` - `instances` - If no error occurs, instances of this Model.
	 * @returns {Promise} Promise.
	 */
	function getAll(keys, index, options, cb) {
		var Collection = this,
			Model;

		if (Collection.model) {
			Model = Collection.model;
		} else if (Collection.collection) {
			Model = Collection;
			Collection = Model.collection;
		} else {
			Model = Collection;
			Collection = extend.apply(Collection, [
				{},
				{
					model: Model,
					collectionName: Model.modelName + 'Collection'
				}
			]);
			collections[Model.modelName + 'Collection'] = Collection;
			Model.collection = Collection;
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

			return Model.connection.run(query, options).then(function (cursor) {
				var deferred = Promise.defer();

				if (options.profile) {
					process.stdout.write(JSON.stringify(cursor.profile, null, 2) + '\n');
					cursor = cursor.value;
				}

				cursor.toArray(function (err, documents) {
					if (err) {
						deferred.reject(err);
					} else {
						if (!options.raw) {
							var length = documents.length;
							for (var i = 0; i < length; i++) {
								documents[i] = new Model(documents[i]);
							}
						}
						deferred.resolve(new Collection(documents));
					}
				});

				return deferred.promise;
			});
		}).nodeify(cb);
	}

	return getAll;
};
