'use strict';

var isFunction = require('mout/lang/isFunction'),
	isObject = require('mout/lang/isObject'),
	async = require('async'),
	r = require('rethinkdb');

module.exports = function get(primaryKey, options, cb) {
	options = options || {};
	if (!primaryKey) {
		throw new Error('Model.get(primaryKey, options, cb): primaryKey: Required!');
	} else if (isFunction(options)) {
		cb = options;
		options = {};
	} else if (!isObject(options)) {
		throw new Error('Model.get(primaryKey, options, cb): options: Must be an object!');
	} else if (!isFunction(cb)) {
		throw new Error('Model.get(primaryKey, options, cb): cb: Must be a function!');
	}

	var Model = this,
		query = r.table(Model.tableName).get(primaryKey);

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
	], cb);
};
