var isFunction = require('mout/lang/isFunction'),
	isObject = require('mout/lang/isObject'),
	isString = require('mout/lang/isString'),
	isArray = require('mout/lang/isArray'),
	isEmpty = require('mout/lang/isEmpty'),
	uppercase = require('mout/string/uppercase'),
	async = require('async'),
	r = require('rethinkdb');

module.exports = function filter(predicate, options, cb) {
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
		throw new Error('Model.filter(predicate, options, cb): predicate: Must be an object!');
	} else if (!isObject(options)) {
		throw new Error('Model.filter(predicate, options, cb): options: Must be an object!');
	} else if (!isFunction(cb)) {
		throw new Error('Model.filter(predicate, options, cb): cb: Must be a function!');
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
		query = query.groupBy(predicate.groupBy);
	}

	if (predicate.pluck) {
		if (isString(predicate.pluck)) {
			query = query.pluck(predicate.pluck);
		} else if (isArray(predicate.pluck)) {
			query = query.pluck.apply(query, predicate.pluck);
		}
	}

	async.waterfall([
		function (next) {
			Model.connection.run(query, options, next);
		},
		function (cursor, next) {
			if (options.profile) {
				process.stdout.write(JSON.stringify(cursor.profile, null, 2) + '\n');
				cursor.value.toArray(next);
			} else {
				cursor.toArray(next);
			}
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
