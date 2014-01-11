/*jshint loopfunc:true*/

var unset = require('../../../../build/instrument/lib/model/prototype/unset'),
	errors = require('../../../../build/instrument/lib/support/errors'),
	IllegalArgumentError = errors.IllegalArgumentError,
	support = require('../../../support/support'),
	Promise = require('bluebird'),
	sinon = require('sinon');

exports.unset = {
	simple: function (test) {
		test.expect(4);

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

			instance.unset('name').then(function (instance) {
				test.deepEqual(instance.attributes, {});
				test.done();
			});
		});
	},
	nested: function (test) {
		test.expect(4);

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

			instance.unset('address.state').then(function (instance) {
				test.deepEqual(instance.attributes, {
					address: {}
				});

				test.done();
			});
		});
	},
	simpleValidateTrue: function (test) {
		test.expect(4);

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

			instance.unset('name', true).then(function (instance) {
				test.deepEqual(instance.attributes, {});

				test.done();
			});
		});
	},
	options: function (test) {
		test.expect(6);

		var instance = {
			attributes: {
				name: 'John'
			},
			unset: unset
		};

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (support.TYPES_EXCEPT_OBJECT[i] && support.TYPES_EXCEPT_OBJECT[i] !== true && typeof support.TYPES_EXCEPT_OBJECT[i] !== 'function') {
				queue.push((function (j) {
					return instance.unset('name', support.TYPES_EXCEPT_OBJECT[i]).then(function () {
						support.fail('Should have failed on ' + support.TYPES_EXCEPT_OBJECT[j]);
					})
						.catch(IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { actual: typeof support.TYPES_EXCEPT_OBJECT[j], expected: 'object' });
						})
						.error(function () {
							support.fail('Should not have an unknown error!');
						});
				})(i));
			}
		}

		Promise.all(queue).finally(function () {
			test.done();
		});
	},
	validate: function (test) {
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
			cb(null, instance);
		};

		sinon.spy(instance.constructor.schema, 'validate');

		instance.unset('name', true, function (err, instance) {
			test.ifError(err);
			test.equal(instance.constructor.schema.validate.callCount, 1);
			instance.unset('name', true).then(function (instance) {
				test.equal(instance.constructor.schema.validate.callCount, 2);
				test.done();
			});
		});
	},
	validateWithError: function (test) {
		test.expect(6);

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

		instance.unset('name', true, function (err) {
			test.equal(err.type, 'ValidationError');
			test.equal(instance.constructor.schema.validate.callCount, 1);
			test.deepEqual(instance.attributes, {
				name: 'John'
			});
			instance.unset('name', true).catch(errors.ValidationError, function (err) {
				test.equal(err.type, 'ValidationError');
				test.equal(instance.constructor.schema.validate.callCount, 2);
				test.deepEqual(instance.attributes, {
					name: 'John'
				});
				test.done();
			});
		});
	}
};
