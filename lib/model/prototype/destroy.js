var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @doc method
 * @id Model.instance_methods:destroy
 * @name destroy(cb)
 * @description
 * Destroy this instance. If the Model for this instance was configured with `softDelete: false`, then
 * the row specified by this instance's primary key will be removed from the database. If the Model for this instance
 * was configured with `softDelete: true`, then the row specified by the instance's primary key will be
 * updated with a `deleted` property set to the UTC datetime (of the database) at which the operation occurs.
 *
 * Example:
 *
 * ```js
 * TODO: Model#destroy(cb) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `cb` must be a function.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {function} cb Callback function. Signature: `cb(err, instance, meta)`. Arguments:
 *
 * - `{UnhandledError}` - `err` - `null` if no error occurs.
 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `destroy(cb)` was called.
 * - `{object}` - `meta` - If no error occurs, meta information about any database query that was performed.
 */
module.exports = function destroy(cb) {
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError('Model#destroy(cb): cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	}

	try {
		var _this = this,
			Model = _this.constructor,
			query = r.table(Model.tableName);

		if (_this.isNew()) {
			return cb(null, _this);
		} else {
			query = query.get(_this.get(Model.idAttribute));
			if (Model.softDelete) {
				var attrs = { deleted: r.now() };
				if (Model.timestamps) {
					attrs.updated = r.now();
				}
				query = query.update(attrs, { return_vals: true });
			} else {
				query = query.delete({ return_vals: true });
			}

			async.waterfall([
				function (next) {
					Model.connection.run(query, next);
				},
				function (cursor, next) {
					if (cursor.errors !== 0) {
						next(cursor.first_error || 'delete failed');
					} else {
						if (Model.softDelete) {
							utils.deepMixIn(_this.attributes, cursor.new_val);
						} else {
							delete _this.attributes[Model.idAttribute];
						}
						_this.previousAttributes = {};
						utils.deepMixIn(_this.previousAttributes, cursor.old_val);
						next(null, _this, cursor);
					}
				}
			], function (err, instance, meta) {
				if (err) {
					return cb(new errors.UnhandledError(err));
				} else {
					return cb(null, instance, meta);
				}
			});
		}
	} catch (err) {
		cb(new errors.UnhandledError(err));
	}
};
