var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @doc method
 * @id Model.static_methods:getAll
 * @name getAll(keys, index[, options], cb)
 * @description
 * Search `Model.tableName` by the specified index for the documents with the given keys. Return a
 * collection of instances of this Model or the raw data if `options.raw === true`.
 *
 *  See [r#filter](http://rethinkdb.com/api/javascript/#filter).
 *
 * Example:
 *
 * ```js
 * TODO: Model.get(...) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `cb` must be a function.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string|array} keys A single key as a string, or an array of keys.
 * @param {string|object} index The name of the secondary index by which to search for `keys`.
 * @param {object=} options Optional configuration. Properties:
 *
 * - `{boolean=false}` - `raw`- If `true`, return the raw data instead of instances of Model.
 *
 * @param {function} cb Callback function. Signature: `cb(err, instances)`. Arguments:
 *
 * - `{UnhandledError}` - `err` - `null` if no error occurs.
 * - `{object}` - `instances` - If no error occurs, instances of this Model.
 */
module.exports = function getAll(keys, index, options, cb) {
	var errorPrefix = 'Model.getAll(keys, index[, options], cb): ';
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
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	} else if (!utils.isArray(keys)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'keys: Must be a string or an array!', { actual: typeof cb, expected: 'string|array' }));
	} else if (!utils.isString(index) && !utils.isObject(index)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'index: Must be a string or an object!', { actual: typeof cb, expected: 'string|object' }));
	} else if (!utils.isObject(options)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof cb, expected: 'object' }));
	}

	try {
		var Model = this;

		keys.push(index);

		var query = r.table(Model.tableName);

		query.getAll.apply(query, keys);

		async.waterfall([
			function (next) {
				Model.connection.run(query, options, next);
			},
			function (cursor, next) {
				var cur = cursor;
				if (options.profile) {
					process.stdout.write(JSON.stringify(cursor.profile, null, 2) + '\n');
					cur = cursor.value;
				}
				cur.toArray(next);
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
