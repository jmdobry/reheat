var mout = require('mout'),
	gPool = require('generic-pool'),
	async = require('async'),
	r = require('rethinkdb');

//noinspection JSValidateJSDoc
/**
 * @member Connection~defaults
 * @desc Default configuration options.
 * @see Connection
 * @see Connection#configure
 */
var defaults = {
	// Default RethinkDB client configuration
	port: 28015,
	host: 'localhost',
	db: 'test',
	authKey: '',

	// Default generic-pool configuration
	name: '',
	max: 1,
	min: 0,
	log: false,
	idleTimeoutMillis: 30000,
	refreshIdle: true,
	reapIntervalMillis: 1000,
	priorityRange: 1
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
		priorityRange: options.priorityRange,
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
 * @summary Constructs a new Connection instance.
 * @desc A Connection instance manages a pool of connections and provides a low-level abstraction for executing
 * pre-defined queries. A Connection is a wrapper around {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
 * and {@link https://github.com/coopernurse/node-pool|generic-pool}.
 * @param {object} options Configuration options for the new Connection instance.
 * @property {number} [options.port=28015] The port to connect on. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
 * @property {string} [options.host='localhost'] The host to connect to. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
 * @property {string} [options.db='test'] The default database. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
 * @property {string} [options.authKey=none] The authentication key. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
 * @property {string} [options.name=''] Name of the connection. Serves only logging purposes. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#name}
 * @property {number} [options.max=1] Maximum number of resources to create at any given time. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#max}
 * @property {number} [options.min=0] Minimum number of resources to keep in pool at any given time. If this is set > max, the pool will silently set the min to max - 1. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#min}
 * @property {boolean|function} [options.log=false] If a log is a function, it will be called with two parameters: <br>- log string<br>- log level ('verbose', 'info', 'warn', 'error')<br>Else if log is true, verbose log info will be sent to console.log(). {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#log}
 * @property {number} [options.idleTimeoutMillis=30000] Max milliseconds a resource can go unused before it should be destroyed. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#idleTimeoutMillis}
 * @property {boolean} [options.refreshIdle=true] Boolean that specifies whether idle resources at or below the min threshold should be destroyed/re-created. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#refreshIdle}
 * @property {number} [options.reapIntervalMillis=1000] Frequency to check for idle resources. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#reapIntervalMillis}
 * @property {number} [options.priorityRange=1] Specifies the priority of the caller if there are no available resources. Lower numbers mean higher priority. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#reapIntervalMillis}
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
	 * @method _get
	 * @see Connection#get
	 * @private
	 * @ignore
	 */
	function _get(key) {
		return _config[key];
	}

	/**
	 * @method _configure
	 * @see Connection#configure
	 * @private
	 * @ignore
	 */
	function _configure(options, strict, cb) {
		var errorPrefix = 'Connection.configure(options[, strict][, cb]): options',
			error = null;

		options = options || {};

		if (!mout.lang.isObject(options)) {
			error = new Error(errorPrefix + ': Must be an object!');
		} else if (options.port && !mout.lang.isNumber(options.port)) {
			error = new Error(errorPrefix + '.port: Must be a number!');
		} else if (options.db && !mout.lang.isString(options.db)) {
			error = new Error(errorPrefix + '.db: Must be a string!');
		} else if (options.host && !mout.lang.isString(options.host)) {
			error = new Error(errorPrefix + '.host: Must be a string!');
		} else if (options.authKey && !mout.lang.isString(options.authKey)) {
			error = new Error(errorPrefix + '.authKey: Must be a string!');
		} else if (options.name && !mout.lang.isString(options.name)) {
			error = new Error(errorPrefix + '.name: Must be a string!');
		} else if (options.max && !mout.lang.isNumber(options.max)) {
			error = new Error(errorPrefix + '.max: Must be a number!');
		} else if (options.min && !mout.lang.isNumber(options.min)) {
			error = new Error(errorPrefix + '.min: Must be a number!');
		} else if (options.idleTimeoutMillis && !mout.lang.isNumber(options.idleTimeoutMillis)) {
			error = new Error(errorPrefix + '.idleTimeoutMillis: Must be a number!');
		} else if (options.log && !mout.lang.isBoolean(options.log) && !mout.lang.isFunction(options.log)) {
			error = new Error(errorPrefix + '.log: Must be a boolean or a function!');
		} else if (options.refreshIdle && !mout.lang.isNumber(options.refreshIdle)) {
			error = new Error(errorPrefix + '.refreshIdle: Must be a number!');
		} else if (options.reapIntervalMillis && !mout.lang.isNumber(options.reapIntervalMillis)) {
			error = new Error(errorPrefix + '.reapIntervalMillis: Must be a number!');
		} else if (options.priorityRange && !mout.lang.isNumber(options.priorityRange)) {
			error = new Error(errorPrefix + '.priorityRange: Must be a number!');
		} else if (cb && !mout.lang.isFunction(cb)) {
			error = new Error('Connection.configure(options[, strict][, cb]): cb: Must be a function!');
		}

		if (error) {
			if (cb && mout.lang.isFunction(cb)) {
				cb(error);
			} else {
				throw error;
			}
		}

		if (_pool) {
			var oldPool = _pool;
			oldPool.drain(cb);
		}

		if (strict) {
			_config = mout.object.deepMixIn({}, defaults, options);
		} else {
			_config = mout.object.deepMixIn({}, options);
		}

		_pool = createPool(_config);
	}

	///////////////////////
	// Wrapper functions //
	///////////////////////
	function _destroy(obj) {
		return _pool.destroy(obj);
	}

	function _acquire(cb, priority) {
		_pool.acquire(cb, priority);
	}

	function _release(obj) {
		return _pool.release(obj);
	}

	function _drain(cb) {
		_pool.drain(cb);
	}

	function _destroyAllNow(cb) {
		_pool.destroyAllNow(cb);
	}

	function _pooled(decorated, priority) {
		return _pool.pooled(decorated, priority);
	}

	function _getPoolSize() {
		return _pool.getPoolSize();
	}

	function _getName() {
		return _pool.getName();
	}

	function _availableObjectsCount() {
		return _pool.availableObjectsCount();
	}

	function _waitingClientsCount() {
		return _pool.waitingClientsCount();
	}

	////////////////////
	// Public methods //
	////////////////////
	/**
	 * @method Connection#get
	 * @desc Simple getter for accessing the configuration options of the Connection instance.
	 * @param {string} key The key of the configuration option to return.
	 * @returns {*} Value of key.
	 * @example
	 *  connection.get('max');  // 20
	 *  connection.get('db');   // 'test'
	 *  connection.get('port'); // 28015
	 */
	this.get = _get;

	/**
	 * @method Connection#configure
	 * @desc Configure the Connection instance with the given options.
	 * @param {object} options New configuration options for the instance.
	 * @property {number} [options.port=28015] The port to connect on. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
	 * @property {string} [options.host='localhost'] The host to connect to. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
	 * @property {string} [options.db='test'] The default database. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
	 * @property {string} [options.authKey=none] The authentication key. {@link http://rethinkdb.com/api/javascript/#connect|r#connect}
	 * @property {string} [options.name=''] Name of the connection. Serves only logging purposes. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#name}
	 * @property {number} [options.max=1] Maximum number of resources to create at any given time. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#max}
	 * @property {number} [options.min=0] Minimum number of resources to keep in pool at any given time. If this is set > max, the pool will silently set the min to max - 1. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#min}
	 * @property {boolean|function} [options.log=false] If a log is a function, it will be called with two parameters: <br>- log string<br>- log level ('verbose', 'info', 'warn', 'error')<br>Else if log is true, verbose log info will be sent to console.log(). {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#log}
	 * @property {number} [options.idleTimeoutMillis=30000] Max milliseconds a resource can go unused before it should be destroyed. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#idleTimeoutMillis}
	 * @property {boolean} [options.refreshIdle=true] Boolean that specifies whether idle resources at or below the min threshold should be destroyed/re-created. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#refreshIdle}
	 * @property {number} [options.reapIntervalMillis=1000] Frequency to check for idle resources. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#reapIntervalMillis}
	 * @property {number} [options.priorityRange=1] Specifies the priority of the caller if there are no available resources. Lower numbers mean higher priority. {@link https://github.com/coopernurse/node-pool#documentation|generic-pool#reapIntervalMillis}
	 * @param {boolean} [strict] If true, reset configuration to the defaults before applying the new options.
	 * @param {function} [cb] Callback function.
	 * @example
	 *  connection.configure({
	 *      db: 'prod_copy'
	 *  });
	 *
	 *  connection.get('db');   //  'prod_copy'
	 *
	 *  connection.configure(null, true);
	 *
	 *  connection.get('db');   //  'test'
	 *
	 *  connection.configure({
	 *      port: 'blahblah'
	 *  }, function (err) {
	 *      err.message;    //  'Connection.configure(options[, strict][, cb]): options.port: Must be a number!'
	 *  });
	 */
	this.configure = _configure;

	// Wrapper methods
	/**
	 * @method Connection#destroy
	 * @desc Request the given client be destroyed.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L144|generic-pool#destroy}.
	 * @param {object} obj The acquired item to be destroyed.
	 * @see https://github.com/coopernurse/node-pool
	 * @example
	 *  connection.acquire(function (err, conn) {
	 *      // do something with "conn" (which is an individual connection to the database
	 *      connection.destroy(conn);
	 *  });
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
	 * @example
	 *  connection.acquire(function (err, conn) {
	 *      // do something with "conn" (which is an individual connection to the database
	 *      connection.release(conn);
	 *  });
	 */
	this.acquire = _acquire;

	/**
	 * @method Connection#release
	 * @desc Return the client to the pool, in case it is no longer required.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L331|generic-pool#release}.
	 * @param {object} obj The acquired object to be put back to the pool.
	 * @see https://github.com/coopernurse/node-pool
	 * @example
	 *  connection.acquire(function (err, conn) {
	 *      // do something with "conn" (which is an individual connection to the database
	 *      r.tableList().run(conn, function (err, tableList) {
	 *          connection.release(conn); // release the connection
	 *      });
	 *  });
	 */
	this.release = _release;

	/**
	 * @method Connection#drain
	 * @desc Disallow any new requests and let the request backlog dissipate.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L357|generic-pool#drain}.
	 * @param {function} [cb] Callback function.
	 * @see https://github.com/coopernurse/node-pool
	 * @example
	 *  connection.drain(function () {
	 *      // connection pool has been drained to the value of "min"
	 *  });
	 */
	this.drain = _drain;

	/**
	 * @method Connection#destroyAllNow
	 * @desc Forcibly destroy all clients regardless of timeout. Intended to be invoked as part of a drain. Does not
	 * prevent the creation of new clients as a result of subsequent calls to acquire.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L392|generic-pool#destroyAllNow}.
	 * @param {function} [cb] Callback function.
	 * @see https://github.com/coopernurse/node-pool
	 * @example
	 *  connection.destroyAllNow(function () {
	 *      // connection pool has been forcibly drained to 0
	 *  });
	 */
	this.destroyAllNow = _destroyAllNow;

	/**
	 * @method Connection#pooled
	 * @desc Decorate a function to use a acquired client from the object pool when called.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L420|generic-pool#pooled}.
	 * @param {function} toDecorate The function to decorate, accepting a client as the first argument and (optionally) a callback as the final argument.
	 * @param {number} priority Integer between 0 and (priorityRange - 1). Specifies the priority of the caller if there are no available resources.  Lower numbers mean higher priority.
	 * @see https://github.com/coopernurse/node-pool
	 */
	this.pooled = _pooled;

	/**
	 * @method Connection#getPoolSize
	 * @desc Return number of resources in the pool, free or in use.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L446|generic-pool#getPoolSize}.
	 * @returns {number} The number of resources in the pool, free or in use.
	 * @see https://github.com/coopernurse/node-pool
	 * @example
	 *  connection.getPoolSize();   //  20
	 */
	this.getPoolSize = _getPoolSize;

	/**
	 * @method Connection#getName
	 * @desc Return the name of the connection.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L450|generic-pool#getName}.
	 * @returns {string} The name of the connection.
	 * @see https://github.com/coopernurse/node-pool
	 * @example
	 *  connection.getName();   //  'prod'
	 */
	this.getName = _getName;

	/**
	 * @method Connection#availableObjectsCount
	 * @desc Return the number of unused resources in the pool
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L454|generic-pool#availableObjectsCount}.
	 * @returns {number} The number of unused resources in the pool
	 * @see https://github.com/coopernurse/node-pool
	 * @example
	 *  busyConnection.availableObjectsCount();   //  0
	 *  idleConnection.availableObjectsCount();   //  20
	 */
	this.availableObjectsCount = _availableObjectsCount;

	/**
	 * @method Connection#waitingClientsCount
	 * @desc Return the number of callers waiting to acquire a resource.
	 * Wrapper for {@link https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L458|generic-pool#waitingClientsCount}.
	 * @returns {number} The number of callers waiting to acquire a resource.
	 * @see https://github.com/coopernurse/node-pool
	 * @example
	 *  busyConnection.waitingClientsCount();   //  5
	 *  idleConnection.waitingClientsCount();   //  0
	 */
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
 * @property {boolean} [options.useOutdated=false] Whether or not outdated reads are OK. {@link http://rethinkdb.com/api/javascript/#run|r#run}
 * @property {boolean} [options.timeFormat='native'] What format to return times in. Set this to 'raw' if you want times returned as JSON objects for exporting. {@link http://rethinkdb.com/api/javascript/#run|r#run}
 * @property {boolean} [options.profile=false] Whether or not to return a profile of the query's execution. {@link http://rethinkdb.com/api/javascript/#run|r#run}
 * @param {function} cb Callback function.
 * @example
 *  // "query" can be any arbitrary ReQL query.
 *  var query = r.table('post');
 *
 *  query = query.filter({ author: 'John Anderson' });
 *
 *  connection.run(query, function (err, cursor) {
 *      cursor.toArray(function (err, posts) {
 *          // array of posts available here
 *      });
 *  });
 *
 *  connection.run(query, { profile: true}, function (err, result) {
 *      result.profile; // query profile
 *      result.value; // cursor
 *
 *      result.value.toArray(function (err, posts) {
 *          // array of posts available here
 *      });
 *  });
 */
Connection.prototype.run = function (query, options, cb) {
	var conn,
		_this = this;

	options = options || {};

	if (mout.lang.isFunction(options)) {
		cb = options;
		options = {};
	} else if (!mout.lang.isFunction(cb)) {
		throw new Error('Connection.run(query, options, cb): cb: Must be a function!');
	} else if (!query) {
		cb(new Error('Connection.run(query, options, cb): query: Required!'));
	} else if (!mout.lang.isObject(options)) {
		cb(new Error('Connection.run(query, options, cb): options: Must be an object!'));
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
