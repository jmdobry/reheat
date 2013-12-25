var deepMixIn = require('mout/object/deepMixIn'),
	cForEach = require('mout/collection/forEach'),
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
	deepMixIn(this.attributes, attrs);

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
deepMixIn(Model.prototype, require('./prototype'));

// Mix in static stuff
deepMixIn(Model, require('./static'));

var hooks = {
	/**
	 * @method Model#beforeValidate
	 * @abstract
	 * @desc Called immediately before the "validate" lifecycle function and executes in the context of a Model
	 * instance. The default implementation does nothing. This method can be overridden in a Model definition (see
	 * example). This method should not pass anything to the callback function unless there is an error, in which case
	 * the lifecycle will be aborted with the error.
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      beforeValidate: function (cb) {
     *          // "this" refers to an instance of Post
     *          if (this.get('author') === 'Walt Disney') {
     *              cb('Impossible!');
     *          } else {
     *              cb();
     *          }
     *  }, {
     *      tableName: 'post'
     *  });
	 *
     *  var post = new Post({ author: 'Walt Disney' });
	 *
     *  post.save(function (err, post) {
     *      err; // Impossible!
     *  });
	 */
	beforeValidate: function (cb) {
		cb(null);
	},

	/**
	 * @method Model#afterValidate
	 * @abstract
	 * @desc Called immediately after the "validate" lifecycle function and executes in the context of a Model
	 * instance. The default implementation does nothing. This method can be overridden in a Model definition (see
	 * example). This method should not pass anything to the callback function unless there is an error, in which case
	 * the lifecycle will be aborted with the error.
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      afterValidate: function (cb) {
     *          // "this" refers to an instance of Post
     *          if (this.get('author') === 'Walt Disney') {
     *              cb('Impossible!');
     *          } else {
     *              cb();
     *          }
     *  }, {
     *      tableName: 'post'
     *  });
	 *
     *  var post = new Post({ author: 'Walt Disney' });
	 *
     *  post.save(function (err, post) {
     *      err; // Impossible!
     *  });
	 */
	afterValidate: function (cb) {
		cb(null);
	},

	/**
	 * @method Model#beforeCreate
	 * @abstract
	 * @desc Called immediately before the "create" lifecycle function (the step when a Model instance is saved to the
	 * server for the first time) and executes in the context of a Model instance. The default implementation does
	 * nothing. This method can be overridden in a Model definition (see example). This method should not pass anything
	 * to the callback function unless there is an error, in which case the lifecycle will be aborted with the error.
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      beforeCreate: function (cb) {
     *          // "this" refers to an instance of Post
     *          if (this.get('author') === 'Walt Disney') {
     *              cb('Impossible!');
     *          } else {
     *              cb();
     *          }
     *  }, {
     *      tableName: 'post'
     *  });
	 *
     *  var post = new Post({ author: 'Walt Disney' });
	 *
     *  post.save(function (err, post) {
     *      err; // Impossible!
     *  });
	 */
	beforeCreate: function (cb) {
		cb(null);
	},

	/**
	 * @method Model#afterCreate
	 * @abstract
	 * @desc Called immediately after the "create" lifecycle function (the step when a Model instance is saved to the
	 * server for the first time) and executes in the context of a Model instance. The default implementation does
	 * nothing. This method can be overridden in a Model definition (see example). This method should pass along the
	 * instance and meta arguments to the callback function, unless there is an error, in which case the lifecycle will
	 * be aborted with the error. The inserted row is still in the database at this point, and it is currently up to the
	 * developer to remove it.
	 * @param {object} instance The instance of the Model.
	 * @param {object} meta Meta information about the database operation that was just performed.
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      afterCreate: function (instance, meta, cb) {
     *          // "this" refers to an instance of Post, and in this case, the "instance" argument is also a reference
     *          // to "this"
     *
     *          // e.g. send a transactional email, log the activity, etc.
     *
     *          cb(null, instance, meta);
     *  }, {
     *      tableName: 'post'
     *  });
	 */
	afterCreate: function (instance, meta, cb) {
		cb(null, instance, meta);
	},

	/**
	 * @method Model#beforeUpdate
	 * @abstract
	 * @desc Called immediately before the "update" lifecycle function (the step when a Model instance is saved to the
	 * server) and executes in the context of a Model instance. The default implementation does nothing. This method
	 * can be overridden in a Model definition (see example). This method should not pass anything to the callback
	 * function unless there is an error, in which case the lifecycle will be aborted with the error.
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      beforeUpdate: function (cb) {
     *          // "this" refers to an instance of Post
     *          if (this.get('author') === 'Walt Disney') {
     *              cb('Impossible!');
     *          } else {
     *              cb();
     *          }
     *  }, {
     *      tableName: 'post'
     *  });
	 *
     *  Post.get(45, function (err, post) {
     *
     *      post.set('author', 'Walt Disney');
     *      post.save(function (err, post) {
     *          err; // Impossible!
     *      });
	 *  });
	 */
	beforeUpdate: function (cb) {
		cb(null);
	},

	/**
	 * @method Model#afterUpdate
	 * @abstract
	 * @desc Called immediately after the "update" lifecycle function (the step when a Model instance is saved to the
	 * database) and executes in the context of a Model instance. The default implementation does nothing. This method
	 * can be overridden in a Model definition (see example). This method should pass along the instance and meta
	 * arguments to the callback function, unless there is an error, in which case the lifecycle will be aborted with
	 * the error. The row in the database has still been updated at this point, and for now it is up to the developer to
	 * roll back the changes in case of an error.
	 * @param {object} instance The instance of the Model.
	 * @param {object} meta Meta information about the database operation that was just performed.
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      afterUpdate: function (instance, meta, cb) {
     *          // "this" refers to an instance of Post, and in this case, the "instance" argument is also a reference
     *          // to "this"
     *
     *          // e.g. send a transactional email, log the activity, etc.
     *
     *          cb(null, instance, meta);
     *  }, {
     *      tableName: 'post'
     *  });
	 */
	afterUpdate: function (instance, meta, cb) {
		cb(null, instance, meta);
	},

	/**
	 * @method Model#beforeDestroy
	 * @abstract
	 * @desc Called immediately before the "destroy" lifecycle function (the step when a Model instance is removed (or
	 * deleted) from the database) and executes in the context of a Model instance. The default implementation does
	 * nothing. This method can be overridden in a Model definition (see example). This method should not pass anything
	 * to the callback function unless there is an error, in which case the lifecycle will be aborted with the error.
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      beforeDestroy: function (cb) {
     *          // "this" refers to an instance of Post
     *          if (this.get('author') === 'Walt Disney') {
     *              cb('Impossible!');
     *          } else {
     *              cb();
     *          }
     *  }, {
     *      tableName: 'post'
     *  });
	 *
     *  Post.get(45, function (err, post) {
     *      post.destroy(function (err, post) {
     *          err; // Impossible!
     *      });
	 *  });
	 */
	beforeDestroy: function (cb) {
		cb(null);
	},

	/**
	 * @method Model#afterDestroy
	 * @abstract
	 * @desc Called immediately after the "destroy" lifecycle function (the step when a Model instance is removed (or
	 * soft deleted) from the database) and executes in the context of a Model instance. The default implementation does
	 * nothing. This method can be overridden in a Model definition (see example). This method should pass along the
	 * instance and meta arguments to the callback function, unless there is an error, in which case the lifecycle will
	 * be aborted with the error. The row in the database has still been updated at this point, and for now it is up to
	 * the developer to roll back the changes in case of an error.
	 * @param {object} instance The instance of the Model.
	 * @param {object} meta Meta information about the database operation that was just performed.
	 * @param {function} cb Callback function.
	 * @example
	 *  var Post = Model.extend({
     *      afterDestroy: function (instance, meta, cb) {
     *          // "this" refers to an instance of Post, and in this case, the "instance" argument is also a reference
     *          // to "this"
     *
     *          // e.g. send a transactional email, log the activity, etc.
     *
     *          cb(null, instance, meta);
     *  }, {
     *      tableName: 'post'
     *  });
	 */
	afterDestroy: function (instance, meta, cb) {
		cb(null, instance, meta);
	}
};

var updateLifecycleHooks = ['beforeSave', 'afterValidate', 'validate', 'beforeValidate'];

// Setup Model#beforeValidate, Model#afterValidate, Model#beforeCreated and Model#beforeUpdate lifecycle hooks
cForEach(updateLifecycleHooks, function (hook) {
	meld.around(Model.prototype, 'save', function (jp) {
		var method;
		if (hook === 'beforeSave') {
			method = jp.target.isNew() ? jp.target.beforeCreate || hooks.beforeCreate : jp.target.beforeUpdate || hooks.beforeUpdate;
		} else {
			method = jp.target[hook] || hooks[hook];
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
			var method = jp.target.isNew() ? jp.target.afterCreate || hooks.afterCreate : jp.target.afterUpdate || hooks.afterUpdate;
			method.apply(jp.target, [instance, meta, jp.args[jp.args.length - 1]]);
		}
	});
});

// Setup Model#before lifecycle hook
meld.around(Model.prototype, 'destroy', function (jp) {
	(jp.target.beforeDestroy || hooks.beforeDestroy).apply(jp.target, [function (err) {
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
			(jp.target.afterDestroy || hooks.afterDestroy).apply(jp.target, [instance, meta, jp.args[jp.args.length - 1]]);
		}
	});
});
