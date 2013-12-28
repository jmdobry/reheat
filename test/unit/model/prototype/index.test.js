/*jshint loopfunc:true*/

var prototype = require('../../../../build/instrument/lib/model/prototype'),
	errors = require('../../../../build/instrument/lib/support/errors'),
	utils = require('../../../../build/instrument/lib/support/utils'),
	support = require('../../../support/support'),
	sinon = require('sinon');

exports.index = {
	escape: function (test) {
		test.expect(10);

		var instance = {
			attributes: {
				name: '<tag>'
			},
			escape: prototype.escape,
			get: prototype.get
		};

		var escaped;
		try {
			escaped = instance.escape('name');
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.equal(escaped, '&lt;tag&gt;');

		for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					instance.escape(support.TYPES_EXCEPT_STRING[i]);
				},
				errors.IllegalArgumentError
			);
		}

		test.done();
	},
	toJSON: function (test) {
		test.expect(1);

		var instance = {
			attributes: {
				name: 'John'
			},
			toJSON: prototype.toJSON
		};

		var json;
		try {
			json = instance.toJSON();
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.deepEqual(json, {
			name: 'John'
		});

		test.done();
	},
	functions: function (test) {
		test.expect(1);

		var instance = {
			attributes: {
				name: 'John'
			},
			toJSON: prototype.toJSON,
			functions: prototype.functions
		};

		var functions;
		try {
			functions = instance.functions();
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.deepEqual(functions, [
			'functions',
			'toJSON'
		]);

		test.done();
	},
	get: function (test) {
		test.expect(11);

		var instance = {
			attributes: {
				name: 'John',
				address: {
					state: 'NY'
				}
			},
			get: prototype.get
		};

		var res;
		try {
			res = instance.get('name');
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.deepEqual(res, 'John');
		try {
			res = instance.get('address.state');
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.deepEqual(res, 'NY');

		for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					instance.get(support.TYPES_EXCEPT_STRING[i]);
				},
				errors.IllegalArgumentError
			);
		}

		test.done();
	},
	has: function (test) {
		test.expect(11);

		var instance = {
			attributes: {
				name: 'John',
				address: {
					state: 'NY'
				}
			},
			has: prototype.has
		};

		var res;
		try {
			res = instance.has('name');
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.ok(res);
		try {
			res = instance.has('address.state');
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.ok(res);

		for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					instance.has(support.TYPES_EXCEPT_STRING[i]);
				},
				errors.IllegalArgumentError
			);
		}

		test.done();
	},
	hasOwn: function (test) {
		test.expect(12);

		var instance = {
			attributes: {
				name: 'John',
				address: {
					state: 'NY'
				},
				'key.with.dots': 'test'
			},
			hasOwn: prototype.hasOwn
		};

		var res;
		try {
			res = instance.hasOwn('name');
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.ok(res);
		try {
			res = instance.hasOwn('address.state');
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.ok(!res);
		try {
			res = instance.hasOwn('key.with.dots');
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.ok(res);

		for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					instance.hasOwn(support.TYPES_EXCEPT_STRING[i]);
				},
				errors.IllegalArgumentError
			);
		}

		test.done();
	},
	clone: function (test) {
		test.expect(3);

		function constructor(attrs) {
			return {
				attributes: utils.clone(attrs),
				constructor: constructor,
				clone: prototype.clone
			};
		}

		var instance = {
			attributes: {
				name: 'John',
				address: {
					state: 'NY'
				},
				'key.with.dots': 'test'
			},
			constructor: constructor,
			clone: prototype.clone
		};

		var clone;
		try {
			clone = instance.clone();
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.deepEqual(clone, {
			attributes: {
				name: 'John',
				address: {
					state: 'NY'
				},
				'key.with.dots': 'test'
			},
			constructor: constructor,
			clone: prototype.clone
		});
		clone.attributes.name = 'Sally';
		test.deepEqual(instance, {
			attributes: {
				name: 'John',
				address: {
					state: 'NY'
				},
				'key.with.dots': 'test'
			},
			constructor: constructor,
			clone: prototype.clone
		});
		test.deepEqual(clone, {
			attributes: {
				name: 'Sally',
				address: {
					state: 'NY'
				},
				'key.with.dots': 'test'
			},
			constructor: constructor,
			clone: prototype.clone
		});

		test.done();
	},
	isNew: function (test) {
		test.expect(2);

		var instance = {
			attributes: {
				_id: 5
			},
			constructor: {
				idAttribute: '_id'
			},
			isNew: prototype.isNew
		};

		var res;
		try {
			res = instance.isNew();
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.ok(!res);

		instance = {
			attributes: {
				name: 'John'
			},
			constructor: {
				idAttribute: '_id'
			},
			isNew: prototype.isNew
		};

		try {
			res = instance.isNew();
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.ok(res);

		test.done();
	},
	lifecycle: function (test) {
		test.expect(8);

		var instance = {
			beforeValidate: prototype.beforeValidate,
			afterValidate: prototype.afterValidate,
			beforeCreate: prototype.beforeCreate,
			afterCreate: prototype.afterCreate,
			beforeUpdate: prototype.beforeUpdate,
			afterUpdate: prototype.afterUpdate,
			beforeDestroy: prototype.beforeDestroy,
			afterDestroy: prototype.afterDestroy
		};

		instance.beforeValidate(function () {
			test.ok(true);
			instance.afterValidate(function () {
				test.ok(true);
				instance.beforeCreate(function () {
					test.ok(true);
					instance.afterCreate(instance, {}, function (err, instance, meta) {
						test.ok(true);
						instance.beforeUpdate(function () {
							test.ok(true);
							instance.afterUpdate(instance, {}, function (err, instance, meta) {
								test.ok(true);
								instance.beforeDestroy(function () {
									test.ok(true);
									instance.afterDestroy(instance, {}, function (err, instance, meta) {
										test.ok(true);
									});
								});
							});
						});
					});
				});
			});
		});

		test.done();
	},
	validate: function (test) {
		test.expect(2);

		var instance = {
			constructor: {
				schema: {}
			},
			validate: prototype.validate
		};

		instance.constructor.schema.validate = function (attrs, cb) {
			cb(null);
		};

		sinon.spy(instance.constructor.schema, 'validate');

		instance.validate(function (err) {
			test.ifError(err);
			test.equal(instance.constructor.schema.validate.callCount, 1);
			test.done();
		});
	},
	noValidate: function (test) {
		test.expect(1);

		var instance = {
			validate: prototype.validate
		};

		instance.validate(function (err) {
			test.deepEqual(err, null);
			test.done();
		});
	},
	validateWithError: function (test) {
		test.expect(4);

		var instance = {
			constructor: {
				schema: {}
			},
			validate: prototype.validate
		};

		instance.constructor.schema.validate = function (attrs, cb) {
			cb({ error: 'test' });
		};

		sinon.spy(instance.constructor.schema, 'validate');

		instance.validate(function (err) {
			test.equal(err.type, 'ValidationError');
			test.equal(err.message, 'Model#validate(cb): Validation failed!');
			test.deepEqual(err.errors, { error: 'test' });
			test.equal(instance.constructor.schema.validate.callCount, 1);
			test.done();
		});
	}
};
