var errors = require('./support/errors'),
	utils = require('./support/utils'),
	Model = require('./model'),
	robocop = require('robocop.js'),
	Connection = require('./connection'),
	extend = require('./support/extend'),
	errorPrefix = 'reheat.defineModel(name, staticProps[, protoProps]): ',
	models = {};

/**
 * @doc interface
 * @id reheat
 * @name reheat
 */
var reheat = {
	Connection: Connection,
	support: {
		UnhandledError: errors.UnhandledError,
		IllegalArgumentError: errors.IllegalArgumentError,
		RuntimeError: errors.RuntimeError,
		ValidationError: errors.ValidationError
	},

	/**
	 * @doc method
	 * @id reheat.defineModel
	 * @name defineModel
	 * @description
	 * Register a new Model with reheat.
	 *
	 * ## Example:
	 *
	 * ```js
	 *  var reheat = require('reheat'),
	 *      connection = new reheat.Connection();
	 *
	 *  var Post = reheat.defineModel('Post, {
	 *      connection: connection,
	 *      tableName: 'post',
	 *      softDelete: true
	 *  }, {
	 *      beforeCreate: function(cb) {
	 *          console.log('before create lifecycle step!');
	 *          cb();
	 *      }
	 *  });
	 *
	 *  // All prototype properties and methods will be available on instances of Post.
	 *  var post = new Post();
	 *
	 *  // All static properties and methods will be available on Post itself.
	 *  Post.tableName; //  'post'
	 *  Post.idAttribute; //  'id'
	 *  Post.connection.run(r.tableList(), function (err, tables) {});
	 *  Post.filter(function (err, posts) {
     *      posts;  //  All posts in the "post" table
     *  });
	 * ```
	 *
	 * @param {string} name
	 * @param {object} staticProps Properties and methods to be added as static properties of the child class. See
	 * Model for static properties and methods. Static methods should not be overridden. Some static properties
	 * have defaults, others are required to be set by the developer, like `Model.connection`. You can add any
	 * static properties and methods you want as long as they don't conflict with already existing static properties and
	 * methods. Properties:
	 *
	 * - `{string="test"}`  - tableName - The name of the table this model should map to.
	 * - `{string="id"}`    - idAttribute - The field that specifies the primary key for instances of this model.
	 * - `{boolean=false}`  - softDelete - Whether to add a `deleted` timestamp field to rows instead of deleting them.
	 * - `{boolean=false}`  - timestamps - Whether reheat should manage timestamps for instances of this model.
	 * - `{Connection}`     - connection - Instance of `reheat.Connection` this model should use.
	 * - `{Schema=}`        - schema - Schema this model should use.
	 *
	 * @param {object=} protoProps Properties and methods to be added to the prototype of the child class. See
	 * Model for default prototype properties and methods. Prototype properties and methods can be overriden for
	 * custom behavior. Properties:
	 *
	 * - `{function=}` - `beforeValidate(cb)`
	 * - `{function=}` - `validate(cb)`
	 * - `{function=}` - `afterValidate(cb)`
	 * - `{function=}` - `beforeCreate(cb)`
	 * - `{function=}` - `afterCreate(instance, cb)`
	 * - `{function=}` - `beforeUpdate(cb)`
	 * - `{function=}` - `afterUpdate(instance, cb)`
	 * - `{function=}` - `beforeDestroy(cb)`
	 * - `{function=}` - `afterDestroy(instance, cb)`
	 *
	 * @returns {Model} model The newly registered Model.
	 */
	defineModel: function (name, staticProps, protoProps) {
		if (!utils.isString(name)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'name: Must be a string!', { name: { actual: typeof name, expected: 'string' } });
		} else if (models[name]) {
			throw new errors.RuntimeError(errorPrefix + 'name: A Model with that name already exists!');
		} else if ('idAttribute' in staticProps && !utils.isString(staticProps.idAttribute)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.idAttribute: Must be a string!', { idAttribute: { actual: typeof staticProps.idAttribute, expected: 'string' } });
		} else if ('tableName' in staticProps && !utils.isString(staticProps.tableName)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.tableName: Must be a string!', { tableName: { actual: typeof staticProps.tableName, expected: 'string' } });
		} else if ('timestamps' in staticProps && !utils.isBoolean(staticProps.timestamps)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.timestamps: Must be a boolean!', { timestamps: { actual: typeof staticProps.timestamps, expected: 'string' } });
		} else if ('softDelete' in staticProps && !utils.isBoolean(staticProps.softDelete)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.softDelete: Must be a boolean!', { softDelete: { actual: typeof staticProps.softDelete, expected: 'string' } });
		} else if (!(staticProps.connection instanceof Connection)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.connection: Must be an instance of Connection!', { connection: { actual: typeof staticProps.connection, expected: 'Connection' } });
		} else if ('schema' in staticProps && staticProps.schema && !utils.isObject(staticProps.schema)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.schema: Must be an object!', { schema: { actual: typeof staticProps.schema, expected: 'object' } });
		} else if ('schema' in staticProps && staticProps.schema && !utils.isFunction(staticProps.schema.validate)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.schema.validate: Must be a function!', { schema: { validate: { actual: typeof staticProps.schema.validate, expected: 'function' } } });
		} else {
			models[name] = extend.apply(Model, [protoProps, staticProps]);
			return models[name];
		}
	},

	unregisterModel: function (name) {
		delete models[name];
	}
};

utils.deepMixIn(reheat, robocop);

delete reheat.Schema;

// Freeze the API
utils.deepFreeze(reheat);

module.exports = reheat;
