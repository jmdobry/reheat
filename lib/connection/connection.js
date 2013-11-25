'use strict';

var _ = require('underscore'),
	gPool = require('generic-pool'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * Default configuration.
 * @type {{
 * port: number,
 * host: string,
 * db: string,
 * authKey: string,
 * max: number,
 * min: number,
 * log: boolean|function,
 * idleTimeoutMillis: number,
 * refreshIdle: boolean,
 * reapIntervalMillis: number
 * }}
 */
var defaults = {
	// Default RethinkDB client configuration
	port: 28015,
	host: 'localhost',
	db: 'test',
	authKey: '',

	// Default node-pool configuration
	// I peaked at 2.3k inserts/second in loadTest.js with ~500 connections
	max: 20,
	min: 1,
	log: false,
	idleTimeoutMillis: 30000,
	refreshIdle: true,
	reapIntervalMillis: 1000
};

/**
 * Create and configure a new node-pool instance.
 * @param {object} options Configuration options for the new instance.
 * @returns {object} New instance of node-pool.
 */
function createPool(options) {

	//noinspection JSValidateTypes
	return gPool.Pool({
		name: options.name,
		max: options.max,
		min: options.min,
		idleTimeoutMillis: options.idleTimeoutMillis,
		log: options.log,
		refreshIdle: options.refreshIdle,
		reapIntervalMillis: options.reapIntervalMillis,
		priorityRange: 10,
		create: function (cb) {
			r.connect({
				host: options.host,
				port: options.port,
				db: options.db,
				authKey: options.authKey
			}, cb);
		},
		destroy: function (conn) {
			if (conn) {
				conn.close();
			}
		}
	});
}

/**
 * Constructs a new Connection instance.
 *
 * A Connection instance manages a pool of connections and provides a low-level abstraction for executing
 * pre-defined queries.
 *
 * @param {object} options Configuration options for the new instance.
 * @constructor
 */
function Connection(options) {

	///////////////////////
	// Private variables //
	///////////////////////
	var _config,
		_pool;

	///////////////////////
	// Private functions //
	///////////////////////
	/**
	 * Simple getter for accessing the configuration options of this Connection instance.
	 * @param {string} key The key of the configuration option to return.
	 * @returns {*} Value of key.
	 * @private
	 */
	function _get(key) {
		return _config[key];
	}

	/**
	 * Configure this Connection instance with the given options.
	 * @param {object} options Configuration options for this instance.
	 * @param {boolean} [strict] If true, reset configuration to the defaults before applying the new options.
	 * @private
	 */
	function _configure(options, strict) {
		var errorPrefix = 'Connection.configure(options, strict): options';

		if (!_.isObject(options)) {
			throw new Error(errorPrefix + ': must be an object!');
		} else if (options.name && !_.isString(options.name)) {
			throw new Error(errorPrefix + '.name: must be a string!');
		} else if (options.max && !_.isNumber(options.max)) {
			throw new Error(errorPrefix + '.max: must be a number!');
		} else if (options.min && !_.isNumber(options.min)) {
			throw new Error(errorPrefix + '.min: must be a number!');
		} else if (options.idleTimeoutMillis && !_.isNumber(options.idleTimeoutMillis)) {
			throw new Error(errorPrefix + '.idleTimeoutMillis: must be a number!');
		} else if (options.log && !_.isBoolean(options.log) && !_.isFunction(options.log)) {
			throw new Error(errorPrefix + '.log: must be a boolean or a function!');
		} else if (options.refreshIdle && !_.isNumber(options.refreshIdle)) {
			throw new Error(errorPrefix + '.refreshIdle: must be a number!');
		} else if (options.reapIntervalMillis && !_.isNumber(options.reapIntervalMillis)) {
			throw new Error(errorPrefix + '.reapIntervalMillis: must be a number!');
		} else if (options.priorityRange && !_.isNumber(options.priorityRange)) {
			throw new Error(errorPrefix + '.priorityRange: must be a number!');
		}

		if (_pool) {
			var oldPool = _pool;
			oldPool.drain();
		}

		if (strict) {
			_config = _.extend({}, defaults, options);
		} else {
			_config = _.extend({}, options);
		}

		_pool = createPool(_config);
	}

	///////////////////////
	// Wrapper functions //
	///////////////////////
	function _destroy(cb, priority) {
		_pool.destroy(cb, priority);
	}

	function _acquire(cb, priority) {
		_pool.acquire(cb, priority);
	}

	function _borrow(cb, priority) {
		_pool.borrow(cb, priority);
	}

	function _release(obj) {
		_pool.release(obj);
	}

	function _returnToPool(obj) {
		_pool.returnToPool(obj);
	}

	function _drain(cb) {
		_pool.drain(cb);
	}

	function _destroyAllNow(cb) {
		_pool.destroyAllNow(cb);
	}

	function _pooled(decorated, priority) {
		_pool.pooled(decorated, priority);
	}

	function _getPoolSize() {
		_pool.getPoolSize();
	}

	function _getName() {
		_pool.getName();
	}

	function _availableObjectsCount() {
		_pool.availableObjectsCount();
	}

	function _waitingClientsCount() {
		_pool.waitingClientsCount();
	}

	////////////////////
	// Public methods //
	////////////////////
	this.get = _get;
	this.configure = _configure;

	// Wrapper methods
	this.destroy = _destroy;
	this.acquire = _acquire;
	this.borrow = _borrow;
	this.release = _release;
	this.returnToPool = _returnToPool;
	this.drain = _drain;
	this.destroyAllNow = _destroyAllNow;
	this.pooled = _pooled;
	this.getPoolSize = _getPoolSize;
	this.getName = _getName;
	this.availableObjectsCount = _availableObjectsCount;
	this.waitingClientsCount = _waitingClientsCount;

	///////////
	// Setup //
	///////////
	_configure(options, true);
}

/**
 * Execute a pre-defined ReQL query.
 * @param {object} query Pre-defined ReQL query.
 * @param {function} cb Callback function.
 */
Connection.prototype.run = function run(query, cb) {
	var conn,
		_this = this;

	async.waterfall([
		function (next) {
			_this.acquire(next);
		},
		function (connection, next) {
			conn = connection;
			query.run(conn, next);
		}
	], function (err, result) {
		if (conn) {
			_this.release(conn);
		}
		if (err) {
			cb(err);
		} else {
			cb(null, result);
		}
	});
};

module.exports = Connection;