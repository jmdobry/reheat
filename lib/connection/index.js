/**
 * @doc function
 * @name Connection
 * @description
 * The `Connection` class is for connecting to instances of RethinkDB. Every `Model` needs an instance of `Connection` in order to operate.
 *
 * `reheat.Connection` is a constructor function for creating instances of `Connection`.
 *
 * Each instance of `Connection` manages a pool of connections and provides a low-level abstraction for executing
 * pre-defined queries. `Connection` is a wrapper around [rethinkdbdash](https://github.com/neumino/rethinkdbdash) with the connection pool enabled.
 *
 * ## Signature:
 * ```js
 * new Connection([options])
 * ```
 *
 * ## Example:
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
 *  var Post = reheat.defineModel('Post', {
 *      connection: connection,
 *      tableName: 'post'
 *  });
 *
 *  var User = reheat.defineModel('User', {
 *      connection: connection,
 *      tableName: 'user'
 *  });
 * ```
 */
var runErrorPrefix = 'Connection#run(query[, options], cb): ';
var queryDefaults = {
  profile: false,
  useOutdated: false,
  timeFormat: 'native',
  noreply: false
};

module.exports = function (r, Promise, utils, errors) {

  /**
   * @doc function
   * @id Connection.class:constructor
   * @name Connection
   * @description
   * `Connection` constructor function.
   *
   * ## Signature:
   * ```js
   * new Connection([options])
   * ```
   *
   * ## Example:
   * ```js
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
   * ```
   *
   * The default options are sufficient for connecting to a default rethinkdb instance listening on `localhost`.
   *
   *  @param {object=} options Optional configuration for the instance of Connection. Properties:
   *
   *  - `{number=28015}` `port` - The port to connect on. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
   *  - `{string="localhost"}` `host` - The host to connect to. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
   *  - `{string="test"}` `db` - The default db to use. This db will be created if it doesn't exist. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
   *  - `{string=""}` `authKey` - The authentication key. See [r#connect](http://rethinkdb.com/api/javascript/#connect).
   *  - `{string=""}` `name` - The name of the connection. See [generic-pool#name](https://github.com/coopernurse/node-pool#documentation).
   *  - `{number=50}` `min` - Minimum number of connections in the pool, default 50
   *  - `{number=1000}` `max` - Maximum number of connections in the pool, default 1000
   *  - `{number=50}` `bufferSize` Minimum number of connections available in the pool, default 50
   *  - `{number=1000}` `timeoutError` Wait time before reconnecting in case of an error (in ms), default 1000
   *  - `{number=60*60*1000}` `timeoutGb` How long the pool keep a connection that hasn't been used (in ms), default 60*60*1000
   *  - `{number=6}` `maxExponent` The maximum timeout before trying to reconnect is 2^maxExponent*timeoutError, default 6 (~60 seconds for the longest wait)
   *  - `{boolean=false}` `silent` Console.error errors (default false)
   *
   *  @returns {Connection} A new instance of Connection.
   */
  function Connection(options) {
    this.r = r(options);
  }

  /**
   * @doc method
   * @id Connection.instance_methods:run
   * @name run
   * @description
   * Execute a pre-defined ReQL query.
   *
   * ## Signature:
   * ```js
   * Connection#run(query[, options][, cb])
   * ```
   *
   * ## Example:
   *
   * ```js
   * // "query" can be any arbitrary ReQL query.
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
	 *      result.result; // cursor
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
   * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, result)`.
   * @returns {Promise} Promise.
   */
  Connection.prototype.run = function (query, options, cb) {
    if (utils.isFunction(options)) {
      cb = options;
      options = {};
    }
    options = options || {};
    if (cb && !utils.isFunction(cb)) {
      throw new errors.IllegalArgumentError(runErrorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
    }
    return Promise.resolve().bind(this)
      .then(function () {
        if (!query) {
          throw new errors.IllegalArgumentError(runErrorPrefix + 'query: Required!', { actual: typeof query, expected: 'function' });
        } else if (!utils.isObject(options)) {
          throw new errors.IllegalArgumentError(runErrorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
        }

        // sanitize and apply defaults
        var opts = utils.merge({}, queryDefaults);
        utils.deepMixIn(opts, options);
        options = utils.pick(opts, ['profile', 'useOutdated', 'timeFormat', 'noreply']);

        if (this.pending && this.pending !== true) {
          return this.pending;
        }
      })
      .then(function () {
        return query.run(options);
      })
      .nodeify(cb);
  };

  return Connection;
};
