/*jshint loopfunc:true*/

var unset = require('../../../../build/instrument/lib/model/prototype/unset'),
	errors = require('../../../../build/instrument/lib/support/errors'),
	support = require('../../../support/support'),
	sinon = require('sinon');

exports.unset = {
	simple: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			unset: unset
		};

		test.deepEqual(instance.attributes, { name: 'John' });
		instance.unset('name', function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {});

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
			unset: unset
		};

		test.deepEqual(instance.attributes, {
			address: {
				state: 'NY'
			}
		});
		instance.unset('address.state', function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				address: {}
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
			unset: unset
		};

		test.deepEqual(instance.attributes, { name: 'John' });
		instance.unset('name', true, function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {});

			test.done();
		});
	},
	noCallback: function (test) {
		test.expect(1);

		var instance = {
			attributes: {
				name: 'John'
			},
			unset: unset
		};

		test.throws(
			function () {
				instance.unset('name');
			},
			errors.InvalidArgumentError,
			'Should fail with no callback'
		);

		test.done();
	},
	options: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			unset: unset
		};

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (!support.TYPES_EXCEPT_OBJECT[i] || support.TYPES_EXCEPT_OBJECT[i] === true || typeof support.TYPES_EXCEPT_OBJECT[i] === 'function') {
				continue;
			}
			instance.unset('name', support.TYPES_EXCEPT_OBJECT[i], function (err, instance) {
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
			unset: unset,
			constructor: {
				schema: {}
			}
		};

		instance.constructor.schema.validate = function (attrs, cb) {
			cb(null, instance);
		};

		sinon.spy(instance.constructor.schema, 'validate');

		instance.unset('name', true, function (err, instance) {
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
			unset: unset,
			constructor: {
				schema: {}
			}
		};

		instance.constructor.schema.validate = function (attrs, cb) {
			cb(new errors.ValidationError('error', { error: 'testError' }));
		};

		sinon.spy(instance.constructor.schema, 'validate');

		instance.unset('name', true, function (err, instance2) {
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
			unset: unset,
			constructor: {
				schema: {}
			}
		};

		instance.unset('name', true, function (err, instance2) {
			test.equal(err.type, 'UnhandledError');
			test.deepEqual(instance.attributes, {
				name: 'John'
			});
			test.done();
		});
	}
};
