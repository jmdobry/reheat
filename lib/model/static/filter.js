var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	r = require('rethinkdb'),
	Promise = require('bluebird'),
	IllegalArgumentError = errors.IllegalArgumentError,
	UnhandledError = errors.UnhandledError,
	errorPrefix = 'Model.filter(predicate[, options], cb): ';

function _filter(predicate, options) {
	var Model = this,
		query = r.table(Model.tableName);

	return Promise.resolve().then(function _filterInner() {

		if (!utils.isEmpty(predicate.where)) {
			query = query.filter(predicate.where);
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
			var toArray;

			if (options.profile) {
				process.stdout.write(JSON.stringify(cursor.profile, null, 2) + '\n');
				toArray = Promise.promisify(cursor.value.toArray);
			} else {
				toArray = Promise.promisify(cursor.toArray);
			}

			return toArray().then(function (documents) {
				if (!options.raw) {
					var length = documents.length;
					for (var i = 0; i < length; i++) {
						documents[i] = new Model(documents[i]);
					}
				}
				return documents;
			});
		});
	});
}

/**
 * @doc method
 * @id Model.static_methods:filter
 * @name filter
 * @description
 * Filter `Model.tableName` by the given predicate. Return a collection of Model instances or the raw data
 * if `options.raw === true`.
 *
 * See [r#filter](http://rethinkdb.com/api/javascript/#filter).
 *
 * ## Signature:
 * ```js
 * Model.filter(predicate[, options][, cb])
 * ```
 *
 * ## Examples:
 *
 * ### Promise-style:
 * ```js
 *  Post.filter({
 *      where: {
 *          author: 'John Anderson'
 *      }
 *  }).then(function (posts) {
 *      // Express will automatically .toJSON() each of these posts
 *      res.send(200, posts);
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
 *  Post.filter({
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
 *
 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instances)`. Arguments:
 *
 * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
 * - `{object}` - `instances` - If no error occurs, instances of this Model.
 * @returns {Promise} Promise.
 */
module.exports = function filter(predicate, options, cb) {
	var Model = this;

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

		return _filter.apply(Model, [predicate, options, cb]);
	}).nodeify(cb);
};
