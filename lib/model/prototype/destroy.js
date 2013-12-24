'use strict';

var isObject = require('mout/lang/isObject'),
	isFunction = require('mout/lang/isFunction'),
	deepMixIn = require('mout/object/deepMixIn'),
	async = require('async'),
	r = require('rethinkdb');

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
