var utils = require('../support/utils'),
	Connection = require('../connection'),
	Schema = require('robocop.js').Schema,
	errors = require('../support/errors'),
	extend = require('./../support/extend'),
	meld = require('meld');

/**
 * @doc function
 * @name Model
 * @description
 * Base Model class. All of your models should extend this class.
 *
 * `Model` provides validation and lifecycle methods to class instances. All static methods of a model return instances of that model by default.
 */
var Model = module.exports = function Model(attrs) {

	attrs = attrs || {};

	/**
	 * @doc property
	 * @id Model.instance_properties:attributes
	 * @name attributes
	 * @description
	 * The internal hash of attributes of this instance of Model. Do not modify this directly, as tracked changes
	 * will be lost, and validation will be skipped. Instead, use Model#set or Model#setSync and Model#get.
	 */
	this.attributes = {};
	utils.deepMixIn(this.attributes, attrs);

	/**
	 * @doc property
	 * @id Model.instance_properties:changed
	 * @name changed
	 * @description
	 * The internal hash of changed attributes since the last save to the database.
	 */
	this.changed = null;
	// TODO: Keep track of changes

	/**
	 * @doc property
	 * @id Model.instance_properties:validationError
	 * @name validationError
	 * @description
	 * The error returned by the last failed validation.
	 */
	this.validationError = null;

	this.initialize.apply(this, arguments);
};

/**
 * @doc method
 * @id Model.static_methods:extend
 * @name Model.extend([proto], static);
 * @description
 * Create a child class of Model.
 *
 * Example:
 *
 * ```js
 *  var Connection = new Connection();
 *
 *  var Post = Model.extend({
 *      beforeCreate: function(cb) {
 *          console.log('before create lifecycle step!');
 *          cb();
 *      }
 *  }, {
 *      connection: connection,
 *      tableName: 'post',
 *      softDelete: true
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
 * @param {object=} protoProps Properties and methods to be added to the prototype of the child class. See
 * Model for default prototype properties and methods. Prototype properties and methods can be overriden for
 * custom behavior. Properties:
 *
 * - `{function=}` - `beforeValidate(cb)`
 * - `{function=}` - `validate(cb)`
 * - `{function=}` - `afterValidate(cb)`
 * - `{function=}` - `beforeCreate(cb)`
 * - `{function=}` - `afterCreate(instance, meta, cb)`
 * - `{function=}` - `beforeUpdate(cb)`
 * - `{function=}` - `afterUpdate(instance, meta, cb)`
 * - `{function=}` - `beforeDestroy(cb)`
 * - `{function=}` - `afterDestroy(instance, meta, cb)`
 *
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
 * - `{Connection}`     - connection - Instance of `Connection` this model should use.
 * - `{Schema=}`        - schema - Instance of `Schema` this model should use.
 */
Model.extend = extend;

// AOP: Validate child classes of Model when they are defined
meld.after(Model, 'extend', function (ChildModel) {
	var errorPrefix = 'Model.extend([protoProps], staticProps): ';
	if (!utils.isString(ChildModel.idAttribute)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.idAttribute: Must be a string!', { idAttribute: { actual: typeof ChildModel.idAttribute, expected: 'string' } });
	} else if (!utils.isString(ChildModel.tableName)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.tableName: Must be a string!', { tableName: { actual: typeof ChildModel.tableName, expected: 'string' } });
	} else if (!utils.isBoolean(ChildModel.timestamps)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.timestamps: Must be a boolean!', { timestamps: { actual: typeof ChildModel.timestamps, expected: 'string' } });
	} else if (!utils.isBoolean(ChildModel.softDelete)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.softDelete: Must be a boolean!', { softDelete: { actual: typeof ChildModel.softDelete, expected: 'string' } });
	} else if (!(ChildModel.connection instanceof Connection)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.connection: Must be an instance of Connection!', { connection: { actual: typeof ChildModel.connection, expected: 'Connection' } });
	} else if (ChildModel.schema && !(ChildModel.schema instanceof Schema)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.schema: Must be an instance of Schema!', { schema: { actual: typeof ChildModel.schema, expected: 'Schema' } });
	}
});

// Mix in prototype methods and properties
utils.deepMixIn(Model.prototype, require('./prototype'));

// Mix in static methods and properties
utils.deepMixIn(Model, require('./static'));

var updateLifecycleHooks = ['beforeSave', 'afterValidate', 'validate', 'beforeValidate'];

// AOP: Setup Model#beforeValidate, Model#afterValidate, Model#beforeCreate and Model#beforeUpdate lifecycle hooks
utils.forEach(updateLifecycleHooks, function (hook) {
	meld.around(Model.prototype, 'save', function (jp) {
		var method;
		if (hook === 'beforeSave') {
			method = jp.target.isNew() ? jp.target.beforeCreate : jp.target.beforeUpdate;
		} else {
			method = jp.target[hook];
		}
		method.apply(jp.target, [function (err) {
			if (err) {
				jp.args[jp.args.length - 1](err);
			} else {
				jp.proceed(jp.args[jp.args.length - 1]);
			}
		}]);
	});
});

// AOP: Setup Model#afterCreate and Model#afterUpdate lifecycle hooks
meld.around(Model.prototype, 'save', function (jp) {
	jp.proceed(function (err, instance, meta) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			// TODO: Test this method selection
			var method = !jp.target.previousAttributes || utils.isEmpty(jp.target.previousAttributes) ? jp.target.afterCreate : jp.target.afterUpdate;
			method.apply(jp.target, [instance, meta, jp.args[jp.args.length - 1]]);
		}
	});
});

// AOP: Setup Model#beforeDestroy lifecycle hook
meld.around(Model.prototype, 'destroy', function (jp) {
	jp.target.beforeDestroy.apply(jp.target, [function (err) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			jp.proceed(jp.args[jp.args.length - 1]);
		}
	}]);
});

// AOP: Setup Model#afterDestroy lifecycle hook
meld.around(Model.prototype, 'destroy', function (jp) {
	jp.proceed(function (err, instance, meta) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			jp.target.afterDestroy.apply(jp.target, [instance, meta, jp.args[jp.args.length - 1]]);
		}
	});
});
