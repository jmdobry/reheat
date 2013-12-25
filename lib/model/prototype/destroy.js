var isFunction = require('mout/lang/isFunction'),
	deepMixIn = require('mout/object/deepMixIn'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @method Model#destroy
 * @desc Destroy the Model instance. If the Model for the instance was configured with "softDelete: false", then the
 * row specified by the instance's primary key will be removed from the database. If the Model for the instance was
 * configured with "softDelete: true", then the row specified by the instance's primary key will be updated with a
 * "deleted" property set to the UTC datetime (of the database) at which the operation occurs.
 * @param {function} cb Callback function.
 */
module.exports = function destroy(cb) {
	if (!isFunction(cb)) {
		throw new Error('instance.destroy(cb): cb: Must be a function!');
	}

	var _this = this,
		Model = _this.constructor,
		query = r.table(Model.tableName).get(_this.attributes[Model.idAttribute]);

	if (Model.softDelete) {
		query = query.update({ deleted: r.now() }, { return_vals: true });
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
					deepMixIn(_this.attributes, cursor.new_val);
				} else {
					delete _this.attributes[Model.idAttribute];
				}
				deepMixIn(_this.previousAttributes, cursor.old_val);
				next(null, _this, cursor);
			}
		}
	], cb);
};
