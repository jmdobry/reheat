var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @method Model.getAll
 * @desc Search {@link Model.tableName} for the document with the given primary key. Return an instance of Model or the
 * raw data if <code>options.raw === true</code>.
 * @static
 * @param {string} primaryKey The primary key of the document to retrieve.
 * @param {object} [options={}]
 * @property {boolean} [options.raw=false] If <code>true</code>, return the raw data instead of an instance of Model.
 * @property {boolean} [options.profile=false] If <code>true</code>, write query profile to stdout.
 * @param {function} cb Callback function. Signature: <code>cb(err, instance)</code>.
 * @see http://rethinkdb.com/api/javascript/#get
 */
module.exports = function get(primaryKey, options, cb) {
	var errorPrefix = errorPrefix + '',
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
