var utils = require('../../support/utils'),
	async = require('async'),
	r = require('rethinkdb');

module.exports = function getAll(keys, index, options, cb) {
	options = options || {};
	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	} else if (!utils.isFunction(cb)) {
		throw new Error('Model.getAll(keys, index[, options], cb): cb: Must be a function!');
	} else if (utils.isString(keys) || utils.isNumber(keys)) {
		keys = [keys];
	} else if (!utils.isArray(keys)) {
		cb(new Error('Model.getAll(keys, index[, options], cb): keys: Must be an array!'));
	} else if (index && utils.isString(index)) {
		index = {
			index: index
		};
	} else if (index && !utils.isObject(index)) {
		cb(new Error('Model.getAll(keys, index[, options], cb): index: Must be an object!'));
	} else if (!utils.isObject(options)) {
		cb(new Error('Model.getAll(keys, index[, options], cb): options: Must be an object!'));
	}
	var Model = this,
		args = keys;

	if (index) {
		args.push(index);
	}

	var query = r.table(Model.tableName);

	query.getAll.apply(query, args);

	async.waterfall([
		function (next) {
			Model.connection.run(query, next);
		},
		function (cursor, next) {
			cursor.toArray(next);
		},
		function (documents, next) {
			if (!options.raw) {
				var length = documents.length;
				for (var i = 0; i < length; i++) {
					documents[i] = new Model(documents[i]);
				}
			}
			next(null, documents);
		}
	], cb);
};
