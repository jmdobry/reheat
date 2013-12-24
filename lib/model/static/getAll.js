'use strict';

var isFunction = require('mout/lang/isFunction'),
	isObject = require('mout/lang/isObject'),
	isString = require('mout/lang/isString'),
	isNumber = require('mout/lang/isNumber'),
	isArray = require('mout/lang/isArray'),
	async = require('async'),
	r = require('rethinkdb');

module.exports = function getAll(keys, index, options, cb) {
	options = options || {};
	if (isString(keys) || isNumber(keys)) {
		keys = [keys];
	} else if (!isArray(keys)) {
		throw new Error('Model.getAll(keys, index, options, cb): keys: Must be an array!');
	} else if (index && isString(index)) {
		index = {
			index: index
		};
	} else if (index && !isObject(index)) {
		throw new Error('Model.getAll(keys, index, options, cb): index: Must be an object!');
	} else if (isFunction(options)) {
		cb = options;
		options = {};
	} else if (!isObject(options)) {
		throw new Error('Model.getAll(keys, index, options, cb): options: Must be an object!');
	} else if (!isFunction(cb)) {
		throw new Error('Model.getAll(keys, index, options, cb): cb: Must be a function!');
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
