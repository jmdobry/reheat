var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	IllegalArgumentError = errors.IllegalArgumentError,
	Promise = require('bluebird'),
	r = require('rethinkdb'),
	errorPrefix = 'Model.get(primaryKey[, options], cb): ';

/**
 * @doc method
 * @id Model.static_methods:get
 * @name get
 * @description
 * Search the table specified by `Model.tableName` for the document with the given primary key. Return an instance of
 * this Model or the raw data if `options.raw === true`.
 *
 * See [r#get](http://rethinkdb.com/api/javascript/#get).
 *
 * ## Signature:
 * ```js
 * Model.get(primaryKey[, options][, cb])
 * ```
 *
 * ## Examples:
 *
 * ### Promise-style:
 * ```js
 *  Post.get('325d2b12-e412-4e0e-be28-c87173f45374').then(function (post) {
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
 *  Post.get('325d2b12-e412-4e0e-be28-c87173f45374', function (err, post) {
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
 * ## Throws/Rejects with
 *
 * - `{IllegalArgumentError}`
 * - `{UnhandledError}`
 *
 * @param {string} primaryKey The primary key of the document to retrieve.
 * @param {object=} options Optional configuration. Properties:
 *
 * - `{boolean=false}` - `raw` - If `true`, return the raw data instead of an instance of Model.
 * - `{boolean=false}` - `profile` - If `true`, write query profile to stdout.
 *
 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
 *
 * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
 * - `{object}` - `instances` - If no error occurs, instances of this Model.
 * @returns {Promise} Promise.
 */
module.exports = function get(primaryKey, options, cb) {
	var Model = this;

	options = options || {};

	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	}

	if (cb && !utils.isFunction(cb)) {
		throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	}

	return Promise.resolve().then(function () {
		if (!utils.isString(primaryKey)) {
			throw new IllegalArgumentError(errorPrefix + 'primaryKey: Must be a string!', { actual: typeof primaryKey, expected: 'string' });
		} else if (!utils.isObject(options)) {
			throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
		}

		return Model.connection.run(r.table(Model.tableName).get(primaryKey), options).then(function (document) {
			var doc = document;
			if (options.profile) {
				process.stdout.write(JSON.stringify(document.profile, null, 2) + '\n');
				doc = document.value;
			}
			if (!doc) {
				return null;
			} else {
				if (!options.raw) {
					return new Model(doc);
				} else {
					return doc;
				}
			}
		});
	}).nodeify(cb);
};
