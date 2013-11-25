'use strict';

var mout = require('mout'),
	extend = require('./../support/extend'),
	meld = require('meld');

var Model = module.exports = function Model(attrs) {

	this.attributes = {};
	attrs = attrs || {};
	mout.object.deepMixIn(this.attributes, attrs);

	this.initialize.apply(this, arguments);
};

Model.extend = extend;

// Mix in model methods
mout.object.deepMixIn(Model.prototype, require('./model'));

// Mix in query methods
mout.object.deepMixIn(Model.prototype, require('./query'));

var hooks = {
	beforeValidate: function beforeValidate(attrs, cb) {
		cb(null, attrs);
	},

	validate: function validate(attrs, cb) {
		cb(null, attrs);
	},

	afterValidate: function afterValidate(attrs, cb) {
		cb(null, attrs);
	},

	beforeSave: function beforeSave(attrs, cb) {
		cb(null, attrs);
	},

	afterSave: function afterSave(attrs, meta, cb) {
		cb(null, attrs, meta);
	},

	beforeDestroy: function beforeDestroy(attrs, cb) {
		cb(null, attrs);
	},

	afterDestroy: function afterDestroy(attrs, meta, cb) {
		cb(null, attrs, meta);
	}
};

var saveLifecycleHooks = ['beforeSave', 'afterValidate', 'validate', 'beforeValidate'];

// Setup Model#save lifecycle hooks
mout.collection.forEach(saveLifecycleHooks, function (hook) {
	meld.around(Model.prototype, 'save', function (jp) {
		(jp.target[hook] || hooks[hook]).apply(jp.target, [jp.target.attributes, function (err, attrs) {
			if (err) {
				jp.args[jp.args.length - 1](err);
			} else {
				jp.proceed(attrs, jp.args[jp.args.length - 1]);
			}
		}]);
	});
});

meld.around(Model.prototype, 'save', function (jp) {
	jp.proceed(jp.args.attrs, jp.args.meta, function (err, attrs, meta) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			(jp.target.afterSave || hooks.afterSave).apply(jp.target, [attrs, meta, jp.args[jp.args.length - 1]]);
		}
	});
});

// Setup Model#destroy lifecycle hooks
meld.around(Model.prototype, 'destroy', function (jp) {
	(jp.target.beforeDestroy || hooks.beforeDestroy).apply(jp.target, [jp.target.attributes, function (err, attrs) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			jp.proceed(attrs, jp.args[jp.args.length - 1]);
		}
	}]);
});

meld.around(Model.prototype, 'destroy', function (jp) {
	jp.proceed(jp.args.attrs, jp.args.meta, function (err, attrs, meta) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			(jp.target.afterDestroy || hooks.afterDestroy).apply(jp.target, [attrs, meta, jp.args[jp.args.length - 1]]);
		}
	});
});