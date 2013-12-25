var mout = require('mout'),
	gPool = require('generic-pool'),
	async = require('async'),
	r = require('rethinkdb');

//noinspection JSValidateJSDoc
/**
 * @member Connection~defaults
 * @property {number} [port=28015] The port to connect on. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
 * @property {string} [host='localhost'] The host to connect to. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
 * @property {string} [db='test'] The default database. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
 * @property {string} [authKey=none] The authentication key. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
 * @property {number} [max=1] Maximum number of resources to create at any given time. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#max}
 * @property {number} [min=0] Minimum number of resources to keep in pool at any given time. If this is set > max, the pool will silently set the min to max - 1. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#min}
 * @property {boolean|function} [log=false] If a log is a function, it will be called with two parameters: <br>- log string<br>- log level ('verbose', 'info', 'warn', 'error')<br>Else if log is true, verbose log info will be sent to console.log(). {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#log}
 * @property {number} [idleTimeoutMillis=30000] Max milliseconds a resource can go unused before it should be destroyed. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#idleTimeoutMillis}
 * @property {boolean} [refreshIdle=true] Boolean that specifies whether idle resources at or below the min threshold should be destroyed/re-created. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#refreshIdle}
 * @property {number} [reapIntervalMillis=1000] Frequency to check for idle resources. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#reapIntervalMillis}
 */
var defaults = {
	// Default RethinkDB client configuration
	port: 28015,
	host: 'localhost',
	db: 'test',
	authKey: '',

	// Default generic-pool configuration
	max: 1,
	min: 0,
	log: false,
	idleTimeoutMillis: 30000,
	refreshIdle: true,
	reapIntervalMillis: 1000
};

/**
 * @function createPool
 * @desc Create and configure a new generic-pool instance.
 * @param {object} options Configuration options for the new instance.
 * @returns {object} New instance of generic-pool.
 * @private
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
 * @class Connection
 * @constructor
 * @summary Constructs a new Connection instance.
 * @desc A Connection instance manages a pool of connections and provides a low-level abstraction for executing
 * pre-defined queries. A Connection is a wrapper for {@link https://github.com/coopernurse/node-pool|generic-pool}.
 * @param {object} options Configuration options for the new Connection instance.
 * @see https://github.com/coopernurse/node-pool
 * @example
 *  var localConnection = new Connection({
 *      db: 'local'
 *  });
 *
 *  var remoteConnection = new Connection({
 *      db: 'prod',
 *      host: '123.45.67.890',
 *      authKey: 'secret',
 *      port: 28015
 *  });
 */
var Connection = module.exports = function Connection(options) {

	///////////////////////
	// Private variables //
	///////////////////////
	var _config,
		_pool;

	///////////////////////
	// Private functions //
	///////////////////////
	/**
	 * @function _get
	 * @desc Simple getter for accessing the configuration options of this Connection instance.
	 * @param {string} key The key of the configuration option to return.
	 * @returns {*} Value of key.
	 * @private
	 */
	function _get(key) {
		return _config[key];
	}

	/**
	 * @function _configure
	 * @desc Configure this Connection instance with the given options.
	 * @param {object} options Configuration options for this instance.
	 * @param {boolean} [strict] If true, reset configuration to the defaults before applying the new options.
	 * @private
	 */
	function _configure(options, strict) {
		var errorPrefix = 'Connection.configure(options, strict): options';

		if (!mout.lang.isObject(options)) {
			throw new Error(errorPrefix + ': must be an object!');
		} else if (options.name && !mout.lang.isString(options.name)) {
			throw new Error(errorPrefix + '.name: must be a string!');
		} else if (options.max && !mout.lang.isNumber(options.max)) {
			throw new Error(errorPrefix + '.max: must be a number!');
		} else if (options.min && !mout.lang.isNumber(options.min)) {
			throw new Error(errorPrefix + '.min: must be a number!');
		} else if (options.idleTimeoutMillis && !mout.lang.isNumber(options.idleTimeoutMillis)) {
			throw new Error(errorPrefix + '.idleTimeoutMillis: must be a number!');
		} else if (options.log && !mout.lang.isBoolean(options.log) && !mout.lang.isFunction(options.log)) {
			throw new Error(errorPrefix + '.log: must be a boolean or a function!');
		} else if (options.refreshIdle && !mout.lang.isNumber(options.refreshIdle)) {
			throw new Error(errorPrefix + '.refreshIdle: must be a number!');
		} else if (options.reapIntervalMillis && !mout.lang.isNumber(options.reapIntervalMillis)) {
			throw new Error(errorPrefix + '.reapIntervalMillis: must be a number!');
		} else if (options.priorityRange && !mout.lang.isNumber(options.priorityRange)) {
			throw new Error(errorPrefix + '.priorityRange: must be a number!');
		}

		if (_pool) {
			var oldPool = _pool;
			oldPool.drain();
		}

		if (strict) {
			_config = mout.object.deepMixIn({}, defaults, options);
		} else {
			_config = mout.object.deepMixIn.extend({}, options);
		}

		_pool = createPool(_config);
	}

	///////////////////////
	// Wrapper functions //
	///////////////////////
	function _destroy(obj) {
		_pool.destroy(obj);
	}

	function _acquire(cb, priority) {
		_pool.acquire(cb, priority);
	}

	function _release(obj) {
		_pool.release(obj);
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
	/**
	 * @method Connection#destroy
	 * @desc Request the given client be destroyed.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L144|generic-pool#destroy}.
	 * @param {object} obj The acquired item to be destroyed.
	 * @see https://github.com/coopernurse/node-pool
	 */
	this.destroy = _destroy;

	/**
	 * @method Connection#acquire
	 * @desc Request a new client. The callback will be called with a new client when one is available.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L311|generic-pool#acquire}.
	 * @param {function} cb Callback function.
	 * @param {number} [priority] Integer between 0 and (priorityRange - 1).  Specifies the priority of the caller if
	 * there are no available resources.  Lower numbers mean higher priority.
	 * @see https://github.com/coopernurse/node-pool
	 */
	this.acquire = _acquire;

	/**
	 * @method Connection#release
	 * @desc Return the client to the pool, in case it is no longer required.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L331|generic-pool#release}.
	 * @param {object} obj The acquired object to be put back to the pool.
	 * @see https://github.com/coopernurse/node-pool
	 */
	this.release = _release;

	/**
	 * @method Connection#drain
	 * @desc Disallow any new requests and let the request backlog dissipate.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L357|generic-pool#drain}.
	 * @param {function} [cb] Callback function.
	 * @see https://github.com/coopernurse/node-pool
	 */
	this.drain = _drain;

	/**
	 * @method Connection#destroyAllNow
	 * @desc Forcibly destroy all clients regardless of timeout. Intended to be invoked as part of a drain. Does not
	 * prevent the creation of new clients as a result of subsequent calls to acquire.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L392|generic-pool#destroyAllNow}.
	 * @param {function} [cb] Callback function.
	 * @see https://github.com/coopernurse/node-pool
	 */
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
};

/**
 * @method Connection#run
 * @desc Execute a pre-defined ReQL query.
 * @param {object} query Pre-defined ReQL query.
 * @param {object} [options={}] Optional configuration.
 * @param {function} cb Callback function.
 */
Connection.prototype.run = function (query, options, cb) {
	var conn,
		_this = this;

	options = options || {};

	if (!query) {
		throw new Error('Connection.run(query, options, cb): query: Required!');
	} else if (mout.lang.isFunction(options)) {
		cb = options;
		options = {};
	} else if (!mout.lang.isObject(options)) {
		throw new Error('Connection.run(query, options, cb): options: Must be an object!');
	} else if (!mout.lang.isFunction(cb)) {
		throw new Error('Connection.run(query, options, cb): cb: Must be a function!');
	}

	async.waterfall([
		function (next) {
			_this.acquire(next);
		},
		function (connection, next) {
			conn = connection;
			options.connection = conn;
			query.run(options, next);
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
