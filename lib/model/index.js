var deepMixIn = require('mout/object/deepMixIn'),
	cForEach = require('mout/collection/forEach'),
	extend = require('./../support/extend'),
	meld = require('meld');

/**
 * @class Model
 * @type {Function}
 * @example
 var Post = Model.extend({}, {});
 */
var Model = module.exports = function Model(attrs) {

	this.attributes = {};
	attrs = attrs || {};
	deepMixIn(this.attributes, attrs);

	// A hash of attributes whose current and previous value differ.
	this.changed = null;

	// The value returned during the last failed validation.
	this.validationError = null;

	this.initialize.apply(this, arguments);
};

Model.extend = extend;

// Mix in instance stuff
deepMixIn(Model.prototype, require('./prototype'));

// Mix in static stuff
deepMixIn(Model, require('./static'));

var hooks = {
	/**
	 * @method Model.prototype.beforeValidate
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

	validate: function (cb) {
		cb(null);
	},

	/**
	 * @method Model.prototype.afterValidate
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
	 * @method Model.prototype.beforeCreate
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
	 * @method Model.prototype.afterCreate
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
     *          // "this" refers to an instance of Post, in this case, the "instance" argument is a reference to "this"
     *
     *          // Send a transactional email or something
     *
     *          cb(null, instance, meta);
     *  }, {
     *      tableName: 'post'
     *  });
	 */
	afterCreate: function (instance, meta, cb) {
		cb(null, instance, meta);
	},

	beforeUpdate: function (cb) {
		cb(null);
	},

	afterUpdate: function (exercise, meta, cb) {
		cb(null, exercise, meta);
	},

	beforeDestroy: function (cb) {
		cb(null);
	},

	afterDestroy: function (exercise, meta, cb) {
		cb(null, exercise, meta);
	}
};

var updateLifecycleHooks = ['beforeSave', 'afterValidate', 'validate', 'beforeValidate'];

// Setup Model#save lifecycle hooks
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

// Setup Model#destroy lifecycle hooks
meld.around(Model.prototype, 'destroy', function (jp) {
	(jp.target.beforeDestroy || hooks.beforeDestroy).apply(jp.target, [function (err) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			jp.proceed(jp.args[jp.args.length - 1]);
		}
	}]);
});

meld.around(Model.prototype, 'destroy', function (jp) {
	jp.proceed(function (err, instance, meta) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			(jp.target.afterDestroy || hooks.afterDestroy).apply(jp.target, [instance, meta, jp.args[jp.args.length - 1]]);
		}
	});
});
