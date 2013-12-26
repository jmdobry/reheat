var utils = require('../../support/utils'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @method Model.filter
 * @desc Filter {@link Model.tableName} by the given predicate. Return a collection of Model instances.
 * @static
 * @param {object} [predicate={}] Optional predicate.
 * @property {object} [predicate.where={}] Where clause. See {@link http://rethinkdb.com/api/javascript/#filter}
 * @property {string|array.<string>|array.<array>} [predicate.orderBy=[]] orderBy clause. See {@link http://rethinkdb.com/api/javascript/#order_by}
 * @property {number} [predicate.limit] Limit clause. See {@link http://rethinkdb.com/api/javascript/#limit}
 * @property {number} [predicate.skip] Skip clause. See {@link http://rethinkdb.com/api/javascript/#skip}
 * @property {string|array} [predicate.pluck] Pluck clause. Only applies if `raw` === true. See {@link http://rethinkdb.com/api/javascript/#pluck}
 * @param {object} [options={}] Optional configuration.
 * @property {boolean} [options.raw=false] If true, return the raw data instead of instances of Model.
 * @param {function} cb Callback function.
 * @see http://rethinkdb.com/api/javascript/#filter
 */
module.exports = function filter(predicate, options, cb) {
	predicate = predicate || {};
	options = options || {};
	if (utils.isFunction(predicate)) {
		cb = predicate;
		predicate = {};
		options = {};
	} else if (utils.isFunction(options)) {
		cb = options;
		options = {};
	} else if (!utils.isFunction(cb)) {
		throw new Error('Model.filter([predicate][, options], cb): cb: Must be a function!');
	} else if (!utils.isObject(predicate)) {
		cb(new Error('Model.filter([predicate][, options], cb): predicate: Must be an object!'));
	} else if (!utils.isObject(options)) {
		cb(new Error('Model.filter([predicate][, options], cb): options: Must be an object!'));
	}

	predicate.where = predicate.where || {};

	if (utils.isString(predicate.where)) {
		predicate.where = JSON.parse(predicate.where);
	}

	var Model = this,
		query = r.table(Model.tableName);

	if (!utils.isEmpty(predicate.where)) {
		query = query.filter(predicate.where);
	}
	if (predicate.orderBy) {
		if (utils.isString(predicate.orderBy)) {
			predicate.orderBy = [
				[predicate.orderBy, 'asc']
			];
		}
		for (var i = 0; i < predicate.orderBy.length; i++) {
			if (utils.isString(predicate.orderBy[i])) {
				predicate.orderBy[i] = [predicate.orderBy[i], 'asc'];
			}
			query = utils.uppercase(predicate.orderBy[i][1]) === 'DESC' ? query.orderBy(r.desc(predicate.orderBy[i][0])) : query.orderBy(predicate.orderBy[i][0]);
		}
	}
	if (predicate.limit) {
		query = query.limit(parseInt(predicate.limit, 10));
	}
	if (predicate.skip) {
		query = query.skip(parseInt(predicate.skip, 10));
	}

	if (predicate.pluck && options.raw) {
		if (utils.isString(predicate.pluck)) {
			query = query.pluck(predicate.pluck);
		} else if (utils.isArray(predicate.pluck)) {
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
