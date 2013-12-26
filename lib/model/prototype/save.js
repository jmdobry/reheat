var isFunction = require('mout/lang/isFunction'),
	deepMixIn = require('mout/object/deepMixIn'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @method Model#save
 * @desc Save the Model instance.
 *
 * If the instance is new (has not yet been saved to the database), then a new row will be inserted into the database
 * with the current attributes of the instance. If the Model for the instance was configured with "timestamps: true"
 * (which is default), then the new row will also be set with a "created" and an "updated" property, set to the UTC
 * datetime (of the database) at which the operation occurs.
 * <br><br>
 * If the instance isn't new (update operation), then the row specified by the primary key of the instance will be
 * updated with the current attributes of the instance. If the Model for the instance was configured with
 * "timestamps: true" (which is default), then the "updated" property of the row specified by the primary key of the
 * instance will be updated with the UTC datetime (of the database) at which the operation occurs.
 * @param {function} cb Callback function.
 */
module.exports = function save(cb) {
	if (!isFunction(cb)) {
		throw new Error('instance.save(cb): cb: Must be a function!');
	}

	var _this = this,
		Model = _this.constructor,
		query = r.table(Model.tableName);

	if (Model.softDelete) {
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
				deepMixIn(_this.attributes, cursor.new_val);
				next(null, _this, cursor);
			}
		}
	], cb);
};