'use strict';

var isFunction = require('mout/lang/isFunction'),
	isObject = require('mout/lang/isObject'),
	isString = require('mout/lang/isString'),
	isEmpty = require('mout/lang/isEmpty'),
	uppercase = require('mout/string/uppercase'),
	async = require('async'),
	r = require('rethinkdb');

module.exports = function count(predicate, options, cb) {
	predicate = predicate || {};
	options = options || {};
	if (isFunction(predicate)) {
		cb = predicate;
		predicate = {};
		options = {};
	} else if (isFunction(options)) {
		cb = options;
		options = {};
	} else if (!isObject(predicate)) {
		throw new Error('Model.count(predicate, options, cb): predicate: Must be an object!');
	} else if (!isObject(options)) {
		throw new Error('Model.count(predicate, options, cb): options: Must be an object!');
	} else if (!isFunction(cb)) {
		throw new Error('Model.count(predicate, options, cb): cb: Must be a function!');
	}

	predicate.where = predicate.where || {};

	if (isString(predicate.where)) {
		predicate.where = JSON.parse(predicate.where);
	}

	var Model = this,
		query = r.table(Model.tableName);

	if (!isEmpty(predicate.where)) {
		query = query.filter(predicate.where);
	}
	if (predicate.sort) {
		if (isString(predicate.sort)) {
			predicate.sort = [
				[predicate.sort, 'asc']
			];
		}
		for (var i = 0; i < predicate.sort.length; i++) {
			if (isString(predicate.sort[i])) {
				predicate.sort[i] = [predicate.sort[i], 'asc'];
			}
			query = uppercase(predicate.sort[i][1]) === 'DESC' ? query.orderBy(r.desc(predicate.sort[i][0])) : query.orderBy(predicate.sort[i][0]);
		}
	}
	if (predicate.limit) {
		query = query.limit(parseInt(predicate.limit, 10));
	}
	if (predicate.skip) {
		query = query.skip(parseInt(predicate.skip, 10));
	}

	if (predicate.groupBy) {
		query = query.groupBy(predicate.groupBy, r.count);
	} else {
		query = query.count();
	}

	async.waterfall([
		function (next) {
			Model.connection.run(query, options, next);
		},
		function (result, next) {
			if (options.profile) {
				process.stdout.write(JSON.stringify(result.profile, null, 2) + '\n');
				next(null, result.value);
			} else {
				next(null, result);
			}
		}
	], cb);
};
