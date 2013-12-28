var utils = require('../support/utils'),
	Connection = require('../connection'),
	Schema = require('robocop.js').Schema,
	errors = require('../support/errors'),
	extend = require('./../support/extend'),
	meld = require('meld');

/**
 * @class Model
 * @abstract
 * @desc Base Model class. All models should inherit from this class. This class provides validation and lifecycle
 * methods to class instances. All static methods of a Model return instances of that Model.
 * @type {function}
 */
var Model = module.exports = function Model(attrs) {

	attrs = attrs || {};

	/**
	 * @member {object} Model#attributes
	 * @desc The internal hash of attributes of this instance of Model. Do not modify this directly, as tracked changes
	 * will be lost, and validation will be skipped. Instead, use {@link Model#set} or {@link Model#setSync} and
	 * {@link Model#get}.
	 * @see Model#set
	 * @see Model#setSync
	 * @see Model#get
	 */
	this.attributes = {};
	utils.deepMixIn(this.attributes, attrs);

	/**
	 * @member {object} Model#changed
	 * @desc The internal hash of changed attributes since the last save to the database.
	 */
	this.changed = null;
	// TODO: Keep track of changes

	/**
	 * @member {object} Model#validationError
	 * @desc The error returned by the last failed validation.
	 */
	this.validationError = null;

	this.initialize.apply(this, arguments);
};

/**
 * @method Model.extend
 * @desc Create a child class of Model.
 * @static
 * @param {object} [protoProps={}] Properties and methods to be added to the prototype of the child class. See
 * {@link Model} for default prototype properties and methods. Prototype properties and methods can be overriden for
 * custom behavior.
 * @property {function} [protoProps.beforeValidate={@link Model#beforeValidate}] See {@link Model#beforeValidate}.
 * @property {function} [protoProps.validate={@link Model#validate}] See {@link Model#validate}.
 * @property {function} [protoProps.afterValidate={@link Model#afterValidate}] See {@link Model#afterValidate}.
 * @property {function} [protoProps.beforeCreate={@link Model#beforeCreate}] See {@link Model#beforeCreate}.
 * @property {function} [protoProps.beforeUpdate={@link Model#beforeUpdate}] See {@link Model#beforeUpdate}.
 * @property {function} [protoProps.afterCreate={@link Model#afterCreate}] See {@link Model#afterCreate}.
 * @property {function} [protoProps.afterUpdate={@link Model#afterUpdate}] See {@link Model#afterUpdate}.
 * @property {function} [protoProps.beforeDestroy={@link Model#beforeDestroy}] See {@link Model#beforeDestroy}.
 * @property {function} [protoProps.afterDestroy={@link Model#afterDestroy}] See {@link Model#afterDestroy}.
 * @param {object} staticProps Properties and methods to be added as static properties of the child class. See
 * {@link Model} for static properties and methods. Static methods should not be overridden. Some static properties
 * have defaults, others are required to be set by the developer, like {@linkmonospace Model.connection}. You can any
 * static properties and methods you want as long as they don't conflict with already existing static properties and
 * methods.
 * @property {string} [staticProps.tableName='test'] See {@link Model.tableName}.
 * @property {string} [staticProps.idAttribute='id'] See {@link Model.idAttribute}.
 * @property {Connection} staticProps.connection See {@link Model.connection}.
 * @property {robocop.Schema} [staticProps.schema=null] See {@link Model.schema}.
 * @see Model
 * @example
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
 *
 */
Model.extend = extend;

// Use AOP to validate child classes of Model when they are defined
meld.after(Model, 'extend', function (ChildModel) {
	var errorPrefix = 'Model.extend([protoProps], staticProps): ';
	if (utils.isString(ChildModel.idAttribute)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.idAttribute: Must be a string!');
	} else if (utils.isString(ChildModel.tableName)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.tableName: Must be a string!');
	} else if (utils.isBoolean(ChildModel.timestamps)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.timestamps: Must be a boolean!');
	} else if (utils.isBoolean(ChildModel.softDelete)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.softDelete: Must be a boolean!');
	} else if (!(ChildModel.connection instanceof Connection)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.connection: Must be an instance of Connection!');
	} else if (ChildModel.schema && !(ChildModel.schema instanceof Schema)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.schema: Must be an instance of Schema!');
	}
});

// Mix in prototype methods and properties
utils.deepMixIn(Model.prototype, require('./prototype'));

// Mix in static methods and properties
utils.deepMixIn(Model, require('./static'));

var updateLifecycleHooks = ['beforeSave', 'afterValidate', 'validate', 'beforeValidate'];

// Setup Model#beforeValidate, Model#afterValidate, Model#beforeCreate and Model#beforeUpdate lifecycle hooks
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

// Setup Model#afterCreate and Model#afterUpdate lifecycle hooks
meld.around(Model.prototype, 'save', function (jp) {
	jp.proceed(function (err, instance, meta) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			var method = jp.target.isNew() ? jp.target.afterCreate : jp.target.afterUpdate;
			method.apply(jp.target, [instance, meta, jp.args[jp.args.length - 1]]);
		}
	});
});

// Setup Model#beforeDestroy lifecycle hook
meld.around(Model.prototype, 'destroy', function (jp) {
	jp.target.beforeDestroy.apply(jp.target, [function (err) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			jp.proceed(jp.args[jp.args.length - 1]);
		}
	}]);
});

// Setup Model#afterDestroy lifecycle hook
meld.around(Model.prototype, 'destroy', function (jp) {
	jp.proceed(function (err, instance, meta) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			jp.target.afterDestroy.apply(jp.target, [instance, meta, jp.args[jp.args.length - 1]]);
		}
	});
});
