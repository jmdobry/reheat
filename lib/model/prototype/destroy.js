var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	IllegalArgumentError = errors.IllegalArgumentError,
	UnhandledError = errors.UnhandledError,
	Promise = require('bluebird'),
	r = require('rethinkdb'),
	errorPrefix = 'Model#destroy([options], cb): ';

/**
 * @doc method
 * @id Model.instance_methods:destroy
 * @name destroy
 * @description
 * Destroy this instance. If the Model for this instance was configured with `softDelete: false`, then
 * the row specified by this instance's primary key will be removed from the database. If the Model for this instance
 * was configured with `softDelete: true`, then the row specified by the instance's primary key will be
 * updated with a `deleted` property set to the UTC datetime (of the database) at which the operation occurs.
 *
 * ## Signature:
 * ```js
 * Model#destroy([options][, cb])
 * ```
 *
 * ## Examples:
 *
 * ### Promise-style:
 * ```js
 *  post.destroy().then(function (post) {
 *      res.send(204, post.get(post.constructor.idAttribute));
 *  })
 *  .error(function (err) {
 *      res.send(500, err.message);
 *  });
 * ```
 *
 * ### Node-style:
 * ```js
 *  post.destroy(function (err, post) {
 *      if (err) {
 *          res.send(500, err.message);
 *      } else {
 *          res.send(204, post.get(post.constructor.idAttribute));
 *      }
 *  });
 * ```
 *
 * ## Throws/Rejects with
 *
 * - `{IllegalArgumentError}`
 * - `{UnhandledError}`
 *
 * @param {object=} options Optional configuration options. Properties:
 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
 *
 * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `destroy(cb)` was called.
 * @returns {Promise} Promise.
 */
module.exports = function destroy(options, cb) {
	var _this = this,
		Model = _this.constructor;

	options = options || {};

	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	}

	if (cb && !utils.isFunction(cb)) {
		throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	}

	return Promise.promisify(_this.beforeDestroy, _this)().then(function () {
		if (!utils.isObject(options)) {
			throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
		}

		if (_this.isNew()) {
			return _this;
		}

		var query = r.table(Model.tableName).get(_this.get(Model.idAttribute));

		if (Model.softDelete) {
			var attrs = { deleted: r.now() };
			if (Model.timestamps) {
				attrs.updated = r.now();
			}
			query = query.update(attrs, { return_vals: true });
		} else {
			query = query.delete({ return_vals: true });
		}

		return Model.connection.run(query, options);
	})
		.then(function (cursor) {
			if (cursor === _this) {
				return Promise.promisify(_this.afterDestroy, _this)(_this);
			}
			if (cursor.errors !== 0) {
				throw new UnhandledError(new Error(cursor.first_error || 'delete failed'));
			} else {
				if (Model.softDelete) {
					utils.deepMixIn(_this.attributes, cursor.new_val);
				} else {
					delete _this.attributes[Model.idAttribute];
				}
				_this.previousAttributes = {};
				_this.meta = cursor;
				utils.deepMixIn(_this.previousAttributes, cursor.old_val);
				return Promise.promisify(_this.afterDestroy, _this)(_this);
			}
		}).nodeify(cb);
};
