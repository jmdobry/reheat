var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @doc method
 * @id Model.static_methods:get
 * @name get(primaryKey[, options], cb)
 * @description Search `Model.tableName` for the document with the given primary key. Return an instance of this Model
 * or the raw data if `options.raw === true`.
 *
 * See [r#get](http://rethinkdb.com/api/javascript/#get).
 *
 * Example:
 *
 * ```js
 * TODO: Model.get(...) example.
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `cb` must be a function.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} primaryKey The primary key of the document to retrieve.
 * @param {object=} options Optional configuration. Properties:
 *
 * - `{boolean=false}` - `raw` - If `true`, return the raw data instead of an instance of Model.
 * - `{boolean=false}` - `profile` - If `true`, write query profile to stdout.
 *
 * @param {function} cb Callback function. Signature: `cb(err, instance)`. Arguments:
 *
 * - `{UnhandledError}` - `err` - `null` if no error occurs.
 * - `{object}` - `instances` - If no error occurs, instances of this Model.
 */
module.exports = function get(primaryKey, options, cb) {
	var errorPrefix = 'Model.get(primaryKey[, options], cb): ',
		Model = this;

	options = options || {};
	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	}
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	} else if (!utils.isString(primaryKey)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'primaryKey: Must be a string!', { actual: typeof primaryKey, expected: 'string' }));
	} else if (!utils.isObject(options)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' }));
	}

	try {
		var query = r.table(Model.tableName).get(primaryKey);

		async.waterfall([
			function (next) {
				Model.connection.run(query, options, next);
			},
			function (document, next) {
				var doc = document;
				if (options.profile) {
					process.stdout.write(JSON.stringify(document.profile, null, 2) + '\n');
					doc = document.value;
				}
				if (!doc) {
					next(null, null);
				} else {
					if (!options.raw) {
						next(null, new Model(doc));
					} else {
						next(null, doc);
					}
				}
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
