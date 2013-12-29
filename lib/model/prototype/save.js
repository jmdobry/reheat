var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @method Model#save
 * @desc Save this instance to the database.
 * If this instance is new (has not yet been saved to the database), then a new row will be inserted into the database
 * with the current attributes of this instance. If this instance's Model was configured with "timestamps: true"
 * (which is default), then the new row will also be set with a "created" and an "updated" property, set to the UTC
 * datetime (of the database) at which the operation occurs.
 * <br><br>
 * If the instance isn't new (update operation), then the row specified by the primary key of the instance will be
 * updated with the current attributes of the instance. If the Model for the instance was configured with
 * "timestamps: true" (which is default), then the "updated" property of the row specified by the primary key of the
 * instance will be updated with the UTC datetime (of the database) at which the operation occurs.
 * @param {function} cb Callback function. Signature: <code>cb(err, instance, meta)</code>
 * @throws {IllegalArgumentError} Argument <code>cb</code> must be a function.
 */
module.exports = function save(cb) {
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError('Model#save(cb): cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	}

	try {
		var _this = this,
			Model = _this.constructor,
			query = r.table(Model.tableName);

		if (Model.timestamps) {
			if (_this.isNew()) {
				_this.attributes.created = r.now();
				_this.attributes.deleted = null;
			}
			_this.attributes.updated = r.now();
		}

		query = query.insert(_this.attributes, { return_vals: true });

		async.waterfall([
			function (next) {
				Model.connection.run(query, next);
			},
			function (cursor, next) {
				if (cursor.errors !== 0) {
					next(cursor.first_error || 'insert failed');
				} else {
					utils.deepMixIn(_this.attributes, cursor.new_val);
					next(null, _this, cursor);
				}
			}
		], function (err, instance, meta) {
			if (err) {
				return cb.apply(_this, [new errors.UnhandledError(err)]);
			} else {
				return cb.apply(_this, [null, instance, meta]);
			}
		});
	} catch (err) {
		return cb.apply(this, [new errors.UnhandledError(err)]);
	}
};
