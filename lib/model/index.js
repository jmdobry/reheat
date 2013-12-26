var utils = require('../support/utils'),
	extend = require('./../support/extend'),
	meld = require('meld');

/**
 * @class Model
 * @abstract
 * @desc Base Model class. All models should inherit from this class. This class provides validation and lifecycle
 * methods to class instances. All static methods of a Model return instances of that Model.
 * @type {function}
 * @example
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
 */
var Model = module.exports = function Model(attrs) {

	attrs = attrs || {};

	/**
	 * @member {object} Model#attributes
	 * @desc The internal hash of attributes of this instance of Model. Do not modify this directly, as change events
	 * will fail to fire, and validation will be skipped. Instead, use {@link Model#set} and {@link Model#get}.
	 * @see Model#set
	 * @see Model#get
	 */
	this.attributes = {};
	utils.deepMixIn(this.attributes, attrs);

	/**
	 * @member {object} Model#changed
	 * @desc The internal hash of changed attributes since the last save to the database.
	 */
	this.changed = null;

	/**
	 * @member {object} Model#validationError
	 * @desc The error returned by the last failed validation.
	 */
	this.validationError = null;

	this.initialize.apply(this, arguments);
};

/**
 * @method Model.extend
 * @desc Creates a child class of Model.
 * @static
 */
Model.extend = extend;

// Mix in instance stuff
utils.deepMixIn(Model.prototype, require('./prototype'));

// Mix in static stuff
utils.deepMixIn(Model, require('./static'));

var updateLifecycleHooks = ['beforeSave', 'afterValidate', 'validate', 'beforeValidate'];

// Setup Model#beforeValidate, Model#afterValidate, Model#beforeCreated and Model#beforeUpdate lifecycle hooks
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

// Setup Model#before lifecycle hook
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
