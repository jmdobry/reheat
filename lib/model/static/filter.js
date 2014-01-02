var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @doc method
 * @id Model.static_methods:filter
 * @name filter(predicate[, options], cb)
 * @description
 * Filter `Model.tableName` by the given predicate. Return a collection of Model instances or the raw data
 * if `options.raw === true`.
 *
 * See [r#filter](http://rethinkdb.com/api/javascript/#filter).
 *
 * Example:
 *
 * ```js
 * TODO: Model.filter(...) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `cb` must be a function.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
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
 * @param {function} cb Callback function. Signature: `cb(err, instances)`. Arguments:
 *
 * - `{UnhandledError}` - `err` - `null` if no error occurs.
 * - `{object}` - `instances` - If no error occurs, instances of this Model.
 */
module.exports = function filter(predicate, options, cb) {
	var errorPrefix = 'Model.filter(predicate[, options], cb): ',
		Model = this;

	options = options || {};
	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	}
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	} else if (!utils.isObject(predicate)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'predicate: Must be an object!', { actual: typeof predicate, expected: 'object' }));
	} else if (!utils.isObject(options)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' }));
	}

	try {
		predicate.where = predicate.where || {};

		if (utils.isString(predicate.where)) {
			predicate.where = JSON.parse(predicate.where);
		} else if (!utils.isObject(predicate.where)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'predicate.where: Must be a string or an object!', { where: { actual: typeof predicate.where, expected: 'string|object' } }));
		}

		var query = r.table(Model.tableName);

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
			var limit = parseInt(predicate.limit, 10);
			if (isNaN(limit)) {
				return cb(new errors.IllegalArgumentError(errorPrefix + 'predicate.limit: Must be a number!', { limit: { actual: typeof predicate.limit, expected: 'number' } }));
			} else {
				query = query.limit(limit);
			}
		}
		if (predicate.skip) {
			var skip = parseInt(predicate.skip, 10);
			if (isNaN(skip)) {
				return cb(new errors.IllegalArgumentError(errorPrefix + 'predicate.skip: Must be a number!', { skip: { actual: typeof predicate.skip, expected: 'number' } }));
			} else {
				query = query.skip(skip);
			}
		}

		if (predicate.pluck && options.raw) {
			if (utils.isString(predicate.pluck)) {
				query = query.pluck(predicate.pluck);
			} else if (utils.isArray(predicate.pluck)) {
				query = query.pluck.apply(query, predicate.pluck);
			} else {
				return cb(new errors.IllegalArgumentError(errorPrefix + 'predicate.pluck: Must be a string or an array!', { pluck: { actual: typeof predicate.pluck, expected: 'string|array' } }));
			}
		}

		async.waterfall([
			function (next) {
				Model.connection.run(query, options, next);
			},
			function (cursor, next) {
				if (options.profile) {
					process.stdout.write(JSON.stringify(cursor.profile, null, 2) + '\n');
					cursor.value.toArray(next);
				} else {
					cursor.toArray(next);
				}
			},
			function (documents, next) {
				if (!options.raw) {
					var length = documents.length;
					for (var i = 0; i < length; i++) {
						documents[i] = new Model(documents[i]);
					}
				}
				next(null, documents);
			}
		], function (err, result) {
			if (err) {
				return cb(new errors.UnhandledError(err));
			} else {
				return cb(null, result);
			}
		});
	} catch (err) {
		return cb(new errors.UnhandledError(err));
	}
};
