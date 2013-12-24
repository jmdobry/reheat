'use strict';

var isObject = require('mout/lang/isObject'),
	isFunction = require('mout/lang/isFunction'),
	deepMixIn = require('mout/object/deepMixIn'),
	async = require('async'),
	r = require('rethinkdb');

module.exports = function save(cb) {
	if (!isFunction(cb)) {
		throw new Error('instance.save(cb): cb: Must be a function!');
	}

	var _this = this,
		Model = _this.constructor,
		query = r.table(Model.tableName);

	if (_this.isNew()) {
		_this.attributes.created = r.now();
	}
	_this.attributes.updated = r.now();

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
