'use strict';

var mout = require('mout'),
	r = require('rethinkdb'),
	async = require('async'),
	get = require('./get'),
	getAll = require('./getAll'),
	filter = require('./filter');

module.exports = {

	// The default name for the JSON `id` attribute is `"id"`.
	idAttribute: 'id',

	/**
	 * Wrapper for RethinkDB#get (see http://rethinkdb.com/api/javascript/#filter)
	 * @param {string|number} primaryKey Primary key of the document to retrieve.
	 * @param {object} [options] Optional configuration.
	 * @param {function} cb Callback function.
	 */
	get: function (primaryKey, options, cb) {
		get.apply(this, [primaryKey, options, cb]);
	},

	/**
	 * Wrapper for RethinkDB#getAll (see http://rethinkdb.com/api/javascript/#filter)
	 * @param {string|number|array} keys The (secondary index) keys of the documents to retrieve.
	 * @param {string|object} [index] The name of the secondary index. Defaults to the primary key.
	 * @param {object} [options] Optional configuration.
	 * @param {function} cb Callback function.
	 */
	getAll: function (keys, index, options, cb) {
		getAll.apply(this, [keys, index, options, cb]);
	},

	/**
	 * Wrapper for RethinkDB#filter (see http://rethinkdb.com/api/javascript/#filter)
	 * @param {object} [predicate] Predicate for this query.
	 * @param {object} [options] Optional configuration.
	 * @param {function} cb Callback function.
	 */
	filter: function (predicate, options, cb) {
		filter.apply(this, [predicate, options, cb]);
	}
};
