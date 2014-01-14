/*jshint loopfunc:true*/

var clear = require('../../../../../build/instrument/lib/model/prototype/clear'),
	errors = require('../../../../../build/instrument/lib/support/errors'),
	support = require('../../../../support/support'),
	Promise = require('bluebird'),
	sinon = require('sinon');

//noinspection JSValidateTypes
exports.clear = {
	simple: function (test) {
		test.expect(5);

		var instance = {
			attributes: {
				name: 'John'
			},
			clear: clear
		};

		test.deepEqual(instance.attributes, { name: 'John' });
		instance.clear(function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {});

			instance.attributes.name = 'John';
			test.deepEqual(instance.attributes, { name: 'John' });

			instance.clear().then(function (instance) {
				test.deepEqual(instance.attributes, {});
				test.done();
			});
		});
	},
	simpleValidateTrue: function (test) {
		test.expect(5);

		var instance = {
			attributes: {
				name: 'John'
			},
			clear: clear
		};

		test.deepEqual(instance.attributes, { name: 'John' });
		instance.clear(true, function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {});

			instance.attributes.name = 'John';
			test.deepEqual(instance.attributes, { name: 'John' });

			instance.clear(true).then(function (instance) {
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
			clear: clear
		};

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (support.TYPES_EXCEPT_OBJECT[i] && support.TYPES_EXCEPT_OBJECT[i] !== true && typeof support.TYPES_EXCEPT_OBJECT[i] !== 'function') {
				queue.push((function (j) {
					return instance.clear(support.TYPES_EXCEPT_OBJECT[i]).then(function () {
						support.fail('Should have failed on ' + support.TYPES_EXCEPT_OBJECT[j]);
					})
						.catch(errors.IllegalArgumentError, function (err) {
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
			clear: clear,
			constructor: {
				schema: {}
			}
		};

		instance.constructor.schema.validate = function (attrs, cb) {
			cb(null, instance);
		};

		sinon.spy(instance.constructor.schema, 'validate');

		instance.clear(true, function (err, instance) {
			test.ifError(err);
			test.equal(instance.constructor.schema.validate.callCount, 1);
			instance.clear(true).then(function (instance) {
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
			clear: clear,
			constructor: {
				schema: {}
			}
		};

		instance.constructor.schema.validate = function (attrs, cb) {
			cb(new errors.ValidationError('error', { error: 'testError' }));
		};

		sinon.spy(instance.constructor.schema, 'validate');

		instance.clear(true, function (err) {
			test.equal(err.type, 'ValidationError');
			test.equal(instance.constructor.schema.validate.callCount, 1);
			test.deepEqual(instance.attributes, {
				name: 'John'
			});
			instance.clear(true).catch(errors.ValidationError, function (err) {
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
