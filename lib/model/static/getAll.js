var utils = require('../../support/utils'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @method Model.getAll
 * @desc Search {@link Model.tableName} by the specified index for the documents with the given keys. Return a
 * collection of Model instances or the raw data if <code>options.raw === true</code>.
 * @static
 * @param {string|array} keys A single key as a string, or an array of keys.
 * @param {string} index The name of the secondary index by which to search for <code>keys</code>. Defaults to the
 * primary key of this Model.
 * @param {object} [options={}]
 * @property {boolean} [options.raw=false] If <code>true</code>, return the raw data instead of instances of Model.
 * @param {function} cb Callback function. Signature: <code>cb(err, instances)</code>.
 * @see http://rethinkdb.com/api/javascript/#getAll
 */
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
