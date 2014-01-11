/*jshint loopfunc:true*/

var setSync = require('../../../../build/instrument/lib/model/prototype/setSync'),
	errors = require('../../../../build/instrument/lib/support/errors'),
	support = require('../../../support/support'),
	sinon = require('sinon');

exports.setSync = {
	simple: function (test) {
		test.expect(2);

		var instance = {
			attributes: {
				name: 'John'
			},
			setSync: setSync
		};

		test.deepEqual(instance.attributes, { name: 'John' });
		try {
			instance.setSync('name', 'Sally');
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.deepEqual(instance.attributes, { name: 'Sally' });
		test.done();
	},
	nested: function (test) {
		test.expect(2);

		var instance = {
			attributes: {
				address: {
					state: 'NY'
				}
			},
			setSync: setSync
		};

		test.deepEqual(instance.attributes, {
			address: {
				state: 'NY'
			}
		});
		try {
			instance.setSync('address.state', 'TX');
		} catch (err) {
			support.fail('Should not reach this');
		}
		test.deepEqual(instance.attributes, {
			address: {
				state: 'TX'
			}
		});
		test.done();
	},
	nestedObject: function (test) {
		test.expect(2);

		var instance = {
			attributes: {
				address: {
					state: 'NY'
				}
			},
			setSync: setSync
		};

		test.deepEqual(instance.attributes, {
			address: {
				state: 'NY'
			}
		});
		instance.setSync({
			address: {
				state: 'TX'
			}
		});
		test.deepEqual(instance.attributes, {
			address: {
				state: 'TX'
			}
		});

		test.done();
	},
	simpleValidateTrue: function (test) {
		test.expect(2);

		var instance = {
			attributes: {
				name: 'John'
			},
			setSync: setSync
		};

		test.deepEqual(instance.attributes, { name: 'John' });
		instance.setSync('name', 'Sally', true);
		test.deepEqual(instance.attributes, {
			name: 'Sally'
		});
		test.done();
	},
	simpleNestedValidateTrue: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			setSync: setSync,
			constructor: {
				schema: {

				}
			}
		};

		instance.constructor.schema.validateSync = function () {
			return null;
		};

		sinon.spy(instance.constructor.schema, 'validateSync');

		test.deepEqual(instance.attributes, { name: 'John' });
		instance.setSync({
			name: 'Sally'
		}, { validate: true });
		test.deepEqual(instance.attributes, {
			name: 'Sally'
		});
		test.equal(instance.constructor.schema.validateSync.callCount, 1);

		test.done();
	},
	key: function (test) {
		test.expect(6);

		var instance = {
			attributes: {
				name: 'John'
			},
			setSync: setSync
		};

		for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			if (typeof support.TYPES_EXCEPT_STRING[i] === 'object') {
				continue;
			}
			test.throws(
				function () {
					instance.setSync(support.TYPES_EXCEPT_STRING[i], 'Sally', {});
				},
				errors.IllegalArgumentError
			);
		}

		test.done();
	},
	options: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			setSync: setSync
		};

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (!support.TYPES_EXCEPT_OBJECT[i] || support.TYPES_EXCEPT_OBJECT[i] === true || typeof support.TYPES_EXCEPT_OBJECT[i] === 'function') {
				continue;
			}
			test.throws(
				function () {
					instance.setSync('name', 'Sally', support.TYPES_EXCEPT_OBJECT[i]);
				},
				errors.IllegalArgumentError
			);
		}

		test.done();
	},
	validate: function (test) {
		test.expect(1);

		var instance = {
			attributes: {
				name: 'John'
			},
			setSync: setSync,
			constructor: {
				schema: {}
			}
		};

		instance.constructor.schema.validateSync = function () {
			return null;
		};

		sinon.spy(instance.constructor.schema, 'validateSync');

		instance.setSync('name', 'Sally', true);
		test.equal(instance.constructor.schema.validateSync.callCount, 1);
		test.done();
	},
	validateWithError: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			setSync: setSync,
			constructor: {
				schema: {}
			}
		};

		instance.constructor.schema.validateSync = function () {
			return new errors.ValidationError('error', { error: 'testError' });
		};

		sinon.spy(instance.constructor.schema, 'validateSync');

		test.throws(
			function () {
				instance.setSync('name', 'Sally', true);
			},
			errors.ValidationError
		);
		test.equal(instance.constructor.schema.validateSync.callCount, 1);
		test.deepEqual(instance.attributes, {
			name: 'John'
		});
		test.done();
	},
	unhandledErrorOne: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			setSync: setSync,
			constructor: {
				schema: {}
			}
		};

		instance.constructor.schema.validateSync = function () {
			throw new Error();
		};

		sinon.spy(instance.constructor.schema, 'validateSync');

		test.throws(
			function () {
				instance.setSync('name', 'Sally', true);
			},
			errors.UnhandledError
		);
		test.equal(instance.constructor.schema.validateSync.callCount, 1);
		test.deepEqual(instance.attributes, {
			name: 'John'
		});
		test.done();
	}
};
