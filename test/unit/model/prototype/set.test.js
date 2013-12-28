/*jshint loopfunc:true*/

var set = require('../../../../build/instrument/lib/model/prototype/set'),
	errors = require('../../../../build/instrument/lib/support/errors'),
	support = require('../../../support/support'),
	sinon = require('sinon');

exports.set = {
	simple: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			set: set
		};

		test.deepEqual(instance.attributes, { name: 'John' });
		instance.set('name', 'Sally', function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, { name: 'Sally' });

			test.done();
		});
	},
	nested: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				address: {
					state: 'NY'
				}
			},
			set: set
		};

		test.deepEqual(instance.attributes, {
			address: {
				state: 'NY'
			}
		});
		instance.set('address.state', 'TX', function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				address: {
					state: 'TX'
				}
			});

			test.done();
		});
	},
	nestedObject: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				address: {
					state: 'NY'
				}
			},
			set: set
		};

		test.deepEqual(instance.attributes, {
			address: {
				state: 'NY'
			}
		});
		instance.set({
			address: {
				state: 'TX'
			}
		}, function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				address: {
					state: 'TX'
				}
			});

			test.done();
		});
	},
	simpleValidateTrue: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			set: set
		};

		test.deepEqual(instance.attributes, { name: 'John' });
		instance.set('name', 'Sally', true, function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				name: 'Sally'
			});

			test.done();
		});
	},
	simpleNestedValidateTrue: function (test) {
		test.expect(4);

		var instance = {
			attributes: {
				name: 'John'
			},
			set: set,
			constructor: {
				schema: {

				}
			}
		};

		instance.constructor.schema.validate = function (attrs, cb) {
			cb(null, instance);
		};

		sinon.spy(instance.constructor.schema, 'validate');

		test.deepEqual(instance.attributes, { name: 'John' });
		instance.set({
			name: 'Sally'
		}, true, function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				name: 'Sally'
			});
			test.equal(instance.constructor.schema.validate.callCount, 1);

			test.done();
		});
	},
	noCallback: function (test) {
		test.expect(1);

		var instance = {
			attributes: {
				name: 'John'
			},
			set: set
		};

		test.throws(
			function () {
				instance.set('name', 'Sally');
			},
			errors.InvalidArgumentError,
			'Should fail with no callback'
		);

		test.done();
	},
	key: function (test) {
		test.expect(6);

		var instance = {
			attributes: {
				name: 'John'
			},
			set: set
		};

		for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			if (typeof support.TYPES_EXCEPT_STRING[i] === 'object') {
				continue;
			}
			instance.set(support.TYPES_EXCEPT_STRING[i], 'Sally', {}, function (err, instance) {
				test.equal(err.type, 'IllegalArgumentError');
			});
		}

		test.done();
	},
	options: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			set: set
		};

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (!support.TYPES_EXCEPT_OBJECT[i] || support.TYPES_EXCEPT_OBJECT[i] === true || typeof support.TYPES_EXCEPT_OBJECT[i] === 'function') {
				continue;
			}
			instance.set('name', 'Sally', support.TYPES_EXCEPT_OBJECT[i], function (err, instance) {
				test.equal(err.type, 'IllegalArgumentError');
			});
		}

		test.done();
	},
	validate: function (test) {
		test.expect(1);

		var instance = {
			attributes: {
				name: 'John'
			},
			set: set,
			constructor: {
				schema: {}
			}
		};

		instance.constructor.schema.validate = function (attrs, cb) {
			cb(null, instance);
		};

		sinon.spy(instance.constructor.schema, 'validate');

		instance.set('name', 'Sally', true, function (err, instance) {
			test.equal(instance.constructor.schema.validate.callCount, 1);
			test.done();
		});
	},
	validateWithError: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			set: set,
			constructor: {
				schema: {}
			}
		};

		instance.constructor.schema.validate = function (attrs, cb) {
			cb(new errors.ValidationError('error', { error: 'testError' }));
		};

		sinon.spy(instance.constructor.schema, 'validate');

		instance.set('name', 'Sally', true, function (err, instance2) {
			test.equal(err.type, 'ValidationError');
			test.equal(instance.constructor.schema.validate.callCount, 1);
			test.deepEqual(instance.attributes, {
				name: 'John'
			});
			test.done();
		});
	},
	unhandledErrorOne: function (test) {
		test.expect(2);

		var instance = {
			attributes: {
				name: 'John'
			},
			set: set,
			constructor: {
				schema: {}
			}
		};

		instance.set('name', 'Sally', true, function (err, instance2) {
			test.equal(err.type, 'UnhandledError');
			test.deepEqual(instance.attributes, {
				name: 'John'
			});
			test.done();
		});
	}
};
