/**
 * @doc function
 * @name Connection
 * @description
 * The `Connection` class is for connecting to instances of RethinkDB. Every `Model` needs an instance of `Connection` in order to operate.
 *
 * `reheat.Connection` is a constructor function for creating instances of `Connection`.
 *
 * Each instance of `Connection` manages a pool of connections and provides a low-level abstraction for executing
 * pre-defined queries. `Connection` is a wrapper around [r#connect](http://rethinkdb.com/api/javascript/#connect)
 * and [generic-pool](https://github.com/coopernurse/node-pool).
 *
 * Example:
 *
 * ```js
 *  var reheat = require('reheat'),
 *      Connection = reheat.Connection,
 *      Model = reheat.Model;
 *
 *  var connection = new Connection({
 *      // rethinkdb connection options
 *      host: '123.45.67.890',
 *      port: 28015,
 *      db: 'production',
 *      authKey: 'secret',
 *
 *      // connection pool options
 *      max: 20,
 *      min: 5
 *  });
 *
 *  // Both Models will pull connections from the same connection pool
 *
 *  var Post = Model.extend(null, {
 *      connection: connection,
 *      tableName: 'post'
 *  });
 *
 *  var User = Model.extend(null, {
 *      connection: connection,
 *      tableName: 'user'
 *  });
 * ```
 *
 * If you've implemented the Circuit Breaker pattern, and your database fails, you can programmatically configure a
 * connection to use a different database using [Connection#confgure(options[, strict], cb)](http://reheat/documentation/api/api/Connection.instance_methods:configure).
 */
var utils = require('../support/utils'),
	errors = require('../support/errors'),
	gPool = require('generic-pool'),
	async = require('async'),
	r = require('rethinkdb');

//noinspection JSValidateJSDoc
/*!
 * @doc object
 * @name Connection.global:defaults
 * @description
 * Default configuration options.
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

/*!
 * @doc function
 * @name Connection.global:createPool
 * @description
 * Create and configure a new `generic-pool` instance.
 * @param {object} options Configuration options for the new instance.
 * @returns {object} A new instance of `generic-pool`.
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

function bindMethods(pool) {
	/**
	 * @doc method
	 * @id Connection.instance_methods:destroy
	 * @name destroy(obj)
	 * @description
	 * Request the given client be destroyed. See [generic-pool#destroy](https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L144).
	 *
	 * Example:
	 *
	 * ```js
	 *  connection.acquire(function (err, conn) {
	 *      // do something with "conn" (which is an individual connection to the database
	 *      connection.destroy(conn);
	 *  });
	 * ```
	 *
	 * @param {object} obj The acquired resource to be destroyed.
	 */
	this.destroy = pool.destroy;

	/**
	 * @doc method
	 * @id Connection.instance_methods:acquire
	 * @name acquire(cb[, priority])
	 * @description
	 * Request a new connection. The callback will be called with a new connection when one is available.
	 *
	 * See [generic-pool#acquire](https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L311).
	 *
	 * Example:
	 *
	 * ```js
	 *  connection.acquire(function (err, conn) {
	 *      // do something with "conn" (which is an individual connection to the database)
	 *      connection.release(conn);
	 *  });
	 * ```
	 *
	 * @param {function} cb Callback function.
	 * @param {number=} priority Integer between 0 and (priorityRange - 1).  Specifies the priority of the caller if
	 * there are no available resources.  Lower numbers mean higher priority.
	 */
	this.acquire = pool.acquire;

	/**
	 * @doc method
	 * @id Connection.instance_methods:release
	 * @name release(cb[, priority])
	 * @description
	 * Release the given connection back into the pool when it is no longer needed.
	 *
	 * See [generic-pool#release](https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L331).
	 *
	 * Example:
	 *
	 * ```js
	 *  connection.acquire(function (err, conn) {
	 *      // do something with "conn" (which is an individual connection to the database
	 *      r.tableList().run(conn, function (err, tableList) {
	 *          connection.release(conn); // release the connection
	 *      });
	 *  });
	 * ```
	 *
	 * @param {object} obj The acquired connection to be released back to the pool.
	 */
	this.release = pool.release;

	/**
	 * @doc method
	 * @id Connection.instance_methods:drain
	 * @name drain([cb])
	 * @description
	 * Disallow any new requests for connections and let the request backlog dissipate.
	 *
	 * See [generic-pool#drain](https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L357).
	 *
	 * Example:
	 *
	 * ```js
	 *  connection.drain(function () {
	 *      // connection pool has been drained to the value of "min"
	 *  });
	 * ```
	 *
	 * @param {function=} cb Callback function. Signature: `cb()`
	 */
	this.drain = pool.drain;

	/**
	 * @doc method
	 * @id Connection.instance_methods:destroyAllNow
	 * @name destroyAllNow([cb])
	 * @description
	 * Forcibly destroy all clients regardless of timeout. Intended to be invoked as part of a drain. Does not
	 * prevent the creation of new clients as a result of subsequent calls to acquire.
	 *
	 * See [generic-pool#destroyAllNow](https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L392).
	 *
	 * Example:
	 *
	 * ```js
	 *  connection.destroyAllNow(function () {
	 *      // connection pool has been forcibly drained to 0
	 *  });
	 * ```
	 *
	 * @param {function=} cb Callback function. Signature: `cb()`
	 */
	this.destroyAllNow = pool.destroyAllNow;

	/**
	 * @doc method
	 * @id Connection.instance_methods:pooled
	 * @name pooled(toDecorate, priority)
	 * @description
	 * Decorate a function to use an acquired connection from the connection pool when called.
	 *
	 * See [generic-pool#pooled](https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L420).
	 *
	 * @param {function} toDecorate The function to decorate, accepting a client as the first argument and (optionally) a callback as the final argument.
	 * @param {number} priority Integer between 0 and (priorityRange - 1). Specifies the priority of the caller if there are no available resources.  Lower numbers mean higher priority.
	 */
	this.pooled = pool.pooled;

	/**
	 * @doc method
	 * @id Connection.instance_methods:getPoolSize
	 * @name getPoolSize( )
	 * @description
	 * Return number of connections in this pool, free or in use.
	 *
	 * See [generic-pool#getPoolSize](https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L446).
	 *
	 * Example:
	 *
	 * ```js
	 *  connection.getPoolSize();   //  20
	 * ```
	 *
	 * @returns {number} The number of connections in this pool, free or in use.
	 */
	this.getPoolSize = pool.getPoolSize;

	/**
	 * @doc method
	 * @id Connection.instance_methods:getName
	 * @name getName( )
	 * @description
	 * Return the name of this connection pool.
	 *
	 * See [generic-pool#getName](https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L450).
	 *
	 * Example:
	 *
	 * ```js
	 *  connection.getName();   //  "prod"
	 * ```
	 *
	 * @returns {number} The name of this connection pool.
	 */
	this.getName = pool.getName;

	/**
	 * @doc method
	 * @id Connection.instance_methods:availableObjectsCount
	 * @name availableObjectsCount( )
	 * @description
	 * Return the number of unused resources in this pool.
	 *
	 * See [generic-pool#availableObjectsCount](https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L454).
	 *
	 * Example:
	 *
	 * ```js
	 *  busyConnection.availableObjectsCount();   //  0
	 *  idleConnection.availableObjectsCount();   //  20
	 * ```
	 *
	 * @returns {number} The number of unused resources in this pool.
	 */
	this.availableObjectsCount = pool.availableObjectsCount;

	/**
	 * @doc method
	 * @id Connection.instance_methods:waitingClientsCount
	 * @name waitingClientsCount( )
	 * @description
	 * Return the number of callers waiting to acquire a connection.
	 *
	 * See [generic-pool#waitingClientsCount](https://github.com/coopernurse/node-pool/blob/master/lib/generic-pool.js#L458).
	 *
	 * Example:
	 *
	 * ```js
	 *  busyConnection.waitingClientsCount();   //  5
	 *  idleConnection.waitingClientsCount();   //  0
	 * ```
	 *
	 * @returns {number} The number of callers waiting to acquire a connection.
	 */
	this.waitingClientsCount = pool.waitingClientsCount;
}

/**
 * @doc function
 * @id Connection.class:constructor
 * @name new Connection(options)
 * @description
 * `Connection` constructor function.
 *
 *  ```js
 *  var reheat = require('reheat'),
 *      Connection = reheat.Connection;
 *
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
 *  ```
 *
 * The default options are sufficient for connecting to a default rethinkdb instance listening on `localhost`.
 *
 *  @param {object=} options Optional configuration for the instance of Connection. Properties:
 *
 *  - `{number=28015}` `port` - The port to connect on. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
 *  - `{string="localhost"}` `host` - The host to connect to. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
 *  - `{string="test"}` `db` - The default db to use. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
 *  - `{string=""}` `authKey` - The authentication key. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
 *  - `{string=""}` `name` - The name of the connection. See [generic-pool#name](https://github.com/coopernurse/node-pool#documentation).
 *  - `{number=1}` `max` - Maximum number of active connections to create at any given time. See [generic-pool#max](https://github.com/coopernurse/node-pool#documentation).
 *  - `{number=0}` `min` - Minimum number of active connections to keep in pool at any given time. If this is set > max, the pool will silently set the min to max - 1. See [generic-pool#min](https://github.com/coopernurse/node-pool#documentation).
 *  - `{boolean|function=false}` `log` - The host to connect to. See [generic-pool#log](https://github.com/coopernurse/node-pool#documentation).
 *  - `{number=30000}` `idleTimeoutMillis` - Max milliseconds a resource can go unused before it should be destroyed. See [generic-pool#idleTimeoutMillis](https://github.com/coopernurse/node-pool#documentation).
 *  - `{boolean=true}` `refreshIdle` - Boolean that specifies whether idle connections at or below the min threshold should be destroyed/re-created. See [generic-pool#refreshIdle](https://github.com/coopernurse/node-pool#documentation).
 *  - `{number=1000}` `reapIntervalMillis` - Frequency to check for idle resources. See [generic-pool#reapIntervalMillis](https://github.com/coopernurse/node-pool#documentation).
 *  - `{number=1}` `priorityRange` - Specifies the priority of the caller if there are no available resources. Lower numbers mean higher priority. See [generic-pool#priorityRange](https://github.com/coopernurse/node-pool#documentation).
 *
 *  @returns {Connection} A new instance of Connection.
 */
var Connection = module.exports = function (options) {

	///////////////////////
	// Private variables //
	///////////////////////
	var _config = {},
		_pool;

	////////////////////
	// Public methods //
	////////////////////
	/**
	 * @doc method
	 * @id Connection.instance_methods:get
	 * @name get(key)
	 * @description
	 * Simple getter for accessing the configuration options of the Connection instance.
	 *
	 * Example:
	 *
	 * ```js
	 * connection.get('max');  // 20
	 * connection.get('db');   // 'test'
	 * connection.get('port'); // 28015
	 * ```
	 *
	 * @param {string} key The key of the configuration option to return.
	 * @returns {*} Value of `key`.
	 */
	this.get = function (key) {
		return _config[key];
	};

	/**
	 * @doc method
	 * @id Connection.instance_methods:configure
	 * @name configure(options[, strict], cb)
	 * @description
	 * Configure the Connection instance with the given options.
	 *
	 * Example:
	 *
	 * ```js
	 * connection.configure({
	 *      db: 'prod_copy'
	 * });
	 *
	 * connection.get('db');   //  'prod_copy'
	 *
	 * connection.configure(null, true);
	 *
	 * connection.get('db');   //  'test'
	 *
	 * connection.configure({
	 *      port: 'blahblah'
	 * }, function (err) {
	 *      err.message;    //  'Connection.configure(options[, strict][, cb]): options.port: Must be a number!'
	 * });
	 * ```
	 *
	 * @param {object} options New configuration options for the instance. Properties:
	 *
	 *  - `{number=28015}` `port` - The port to connect on. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
	 *  - `{string="localhost"}` `host` - The host to connect to. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
	 *  - `{string="test"}` `db` - The default db to use. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
	 *  - `{string=""}` `authKey` - The authentication key. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
	 *  - `{string=""}` `name` - The name of the connection. See [generic-pool#name](https://github.com/coopernurse/node-pool#documentation).
	 *  - `{number=1}` `max` - Maximum number of active connections to create at any given time. See [generic-pool#max](https://github.com/coopernurse/node-pool#documentation).
	 *  - `{number=0}` `min` - Minimum number of active connections to keep in pool at any given time. If this is set > max, the pool will silently set the min to max - 1. See [generic-pool#min](https://github.com/coopernurse/node-pool#documentation).
	 *  - `{boolean|function=false}` `log` - The host to connect to. See [generic-pool#log](https://github.com/coopernurse/node-pool#documentation).
	 *  - `{number=30000}` `idleTimeoutMillis` - Max milliseconds a resource can go unused before it should be destroyed. See [generic-pool#idleTimeoutMillis](https://github.com/coopernurse/node-pool#documentation).
	 *  - `{boolean=true}` `refreshIdle` - Boolean that specifies whether idle connections at or below the min threshold should be destroyed/re-created. See [generic-pool#refreshIdle](https://github.com/coopernurse/node-pool#documentation).
	 *  - `{number=1000}` `reapIntervalMillis` - Frequency to check for idle resources. See [generic-pool#reapIntervalMillis](https://github.com/coopernurse/node-pool#documentation).
	 *  - `{number=1}` `priorityRange` - Specifies the priority of the caller if there are no available resources. Lower numbers mean higher priority. See [generic-pool#priorityRange](https://github.com/coopernurse/node-pool#documentation).
	 *
	 * @param {boolean=} strict Default: `false`. If `true`, reset configuration to the defaults before applying the new options.
	 * @param {function} cb Callback function. Signature: `cb(err)`.
	 */
	this.configure = function (options, strict, cb) {
		var errorPrefix = 'Connection#configure(options[, strict][, cb]): ';

		options = options || {};
		if (utils.isFunction(strict)) {
			cb = strict;
			strict = false;
		}
		if (!utils.isFunction(cb)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
		} else if (!utils.isObject(options)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' }));
		} else if (options.port && !utils.isNumber(options.port)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.port: Must be a number!', { port: { actual: typeof options.port, expected: 'number' } }));
		} else if (options.db && !utils.isString(options.db)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.db: Must be a string!', { db: { actual: typeof options.db, expected: 'string' } }));
		} else if (options.host && !utils.isString(options.host)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.host: Must be a string!', { host: { actual: typeof options.host, expected: 'string' } }));
		} else if (options.authKey && !utils.isString(options.authKey)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.authKey: Must be a string!', { authKey: { actual: typeof options.authKey, expected: 'string' } }));
		} else if (options.name && !utils.isString(options.name)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.name: Must be a string!', { name: { actual: typeof options.name, expected: 'string' } }));
		} else if (options.max && !utils.isNumber(options.max)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.max: Must be a number!', { max: { actual: typeof options.max, expected: 'number' } }));
		} else if (options.min && !utils.isNumber(options.min)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.min: Must be a number!', { min: { actual: typeof options.min, expected: 'number' } }));
		} else if (options.idleTimeoutMillis && !utils.isNumber(options.idleTimeoutMillis)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.idleTimeoutMillis: Must be a number!', { idleTimeoutMillis: { actual: typeof options.idleTimeoutMillis, expected: 'number' } }));
		} else if (options.log && !utils.isBoolean(options.log) && !utils.isFunction(options.log)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.log: Must be a boolean or a function!', { log: { actual: typeof options.log, expected: 'boolean|function' } }));
		} else if (options.refreshIdle && !utils.isBoolean(options.refreshIdle)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.refreshIdle: Must be a boolean!', { refreshIdle: { actual: typeof options.refreshIdle, expected: 'boolean' } }));
		} else if (options.reapIntervalMillis && !utils.isNumber(options.reapIntervalMillis)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.reapIntervalMillis: Must be a number!', { reapIntervalMillis: { actual: typeof options.reapIntervalMillis, expected: 'number' } }));
		} else if (options.priorityRange && !utils.isNumber(options.priorityRange)) {
			return cb(new errors.IllegalArgumentError(errorPrefix + 'options.priorityRange: Must be a number!', { priorityRange: { actual: typeof options.priorityRange, expected: 'number' } }));
		}

		var _oldPool = _pool || null;

		if (strict) {
			_config = utils.deepMixIn(_config, defaults, options);
		} else {
			_config = utils.deepMixIn(_config, options);
		}

		_pool = createPool(_config);
		bindMethods.apply(this, [_pool]);

		if (_oldPool) {
			_oldPool.drain(function () {
				_oldPool.destroyAllNow();
				cb();
			});
		}
	};

	// Initial configuration
	this.configure(options, true, function (err) {
		if (err) {
			throw err;
		}
	});

	bindMethods.apply(this, [_pool]);
};

/**
 * @doc method
 * @id Connection.instance_methods:run
 * @name run(query[, options], cb)
 * @description
 * Execute a pre-defined ReQL query.
 *
 * Example:
 *
 * ```js
 * // "query" can be any arbitrary ReQL query.
 *  var query = r.table('post');
 *
 *  query = query.filter({ author: 'John Anderson' });
 *
 *  Connection#run(query, function (err, cursor) {
 *      cursor.toArray(function (err, posts) {
 *          // array of posts available here
 *      });
 *  });
 *
 *  Connection#run(query, { profile: true}, function (err, result) {
 *      result.profile; // query profile
 *      result.value; // cursor
 *
 *      result.value.toArray(function (err, posts) {
 *          // array of posts available here
 *      });
 *  });
 * ```
 *
 * @param {object} query Pre-defined ReQL query.
 * @param {object=} options Optional configuration. Properties:
 *
 * - `{boolean=false}` `useOutdated` - Whether or not outdated reads are OK. See [r#run](http://rethinkdb.com/api/javascript/#run).
 * - `{string="native"}` `timeFormat` - What format to return times in. Set this to 'raw' if you want times returned as JSON objects for exporting. See [r#run](http://rethinkdb.com/api/javascript/#run).
 * - `{boolean=false}` `profile` - Whether or not to return a profile of the query's execution. See [r#run](http://rethinkdb.com/api/javascript/#run).
 *
 * @param {function} cb Callback function. Signature: `cb(err, result)`.
 */
Connection.prototype.run = function (query, options, cb) {
	var conn,
		_this = this,
		errorPrefix = 'Connection#run(query[, options], cb): ',
		defaults = {
			profile: false,
			useOutdated: false,
			timeFormat: 'native',
			noreply: false
		};

	options = options || {};
	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	}
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof options, expected: 'object' });
	} else if (!query) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'query: Required!', { actual: typeof query, expected: 'function' }));
	} else if (!utils.isObject(options)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof query, expected: 'object' }));
	}

	// sanitize and apply defaults
	utils.deepMixIn(defaults, options);
	options = utils.pick(defaults, ['profile', 'useOutdated', 'timeFormat', 'noreply']);

	try {
		async.waterfall([
			function (next) {
				_this.acquire(next);
			},
			function (connection, next) {
				conn = connection;
				options.connection = conn;
				try {
					query.run(options, next);
				} catch (err) {
					next(err);
				}
			}
		], function (err, result) {
			if (conn) {
				_this.release(conn);
			}
			if (err) {
				return cb(new errors.UnhandledError(err));
			} else {
				return cb(null, result);
			}
		});
	} catch (err) {
		return cb(new errors.UnhandledError(err));
	}
};
