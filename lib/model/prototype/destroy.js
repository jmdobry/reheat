var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @method Model#destroy
 * @desc Destroy this instance. If the Model for this instance was configured with <code>softDelete: false</code>, then
 * the row specified by this instance's primary key will be removed from the database. If the Model for this instance
 * was configured with <code>softDelete: true</code>, then the row specified by the instance's primary key will be
 * updated with a <code>deleted</code> property set to the UTC datetime (of the database) at which the operation occurs.
 * @param {function} cb Callback function. Signature: <code>cb(err, instance, meta)</code>
 * @throws {IllegalArgumentError} Argument <code>cb</code> must be a function.
 */
module.exports = function destroy(cb) {
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError('Model#destroy(cb): cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	}

	try {
		var _this = this,
			Model = _this.constructor,
			query = r.table(Model.tableName).get(_this.attributes[Model.idAttribute]);

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
					utils.deepMixIn(_this.previousAttributes, cursor.old_val);
					next(null, _this, cursor);
				}
			}
		], cb);
	} catch (err) {
		cb(new errors.UnhandledError(err));
	}
};
