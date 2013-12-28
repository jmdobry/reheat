/*jshint loopfunc:true*/

var SandboxedModule = require('sandboxed-module'),
	errors = require('../../../../build/instrument/lib/support/errors'),
	support = require('../../../support/support'),
	async = require('async'),
	destroy = SandboxedModule.require('../../../../build/instrument/lib/model/prototype/destroy', {
		requires: {
			'../../support/utils': require('../../../../build/instrument/lib/support/utils'), // Real dependency
			'../../support/errors': errors, // Real dependency
			rethinkdb: {
				table: function () {
					return {
						get: function (id) {
							return {
								update: function (attrs, options) {
								},
								delete: function (options) {
								}
							};
						}
					};
				},
				now: function () {
					return 5;
				}
			}, // Mock dependency
			async: async // Real dependency
		}
	});

exports.destroyTest = {
	normal: function (test) {
//		test.expect(4);

		var instance = {
			attributes: {
				name: 'John',
				id: 2
			},
			destroy: destroy,
			constructor: {
				connection: {},
				timestamps: false,
				idAttribute: 'id'
			},
			isNew: function () {
				return true;
			}
		};

		instance.constructor.connection.run = function (query, next) {
			next(null, {
				cursor: 'test',
				old_val: {
					name: 'John',
					id: 2
				},
				errors: 0
			});
		};

		instance.destroy(function (err, instance, meta) {
			// These won't work until [this bug](https://github.com/caolan/async/pull/393) is fixed in the async library
//			test.ifError(err);
//			test.deepEqual(instance.attributes, {
//				name: 'John'
//			});
//			test.deepEqual(instance.previousAttributes, {
//				name: 'John',
//				id: 2
//			});
//			test.deepEqual(meta, {
//				cursor: 'test'
//			});
			test.done();
		});
	},
	noCallback: function (test) {
		test.expect(9);

		var instance = {
			attributes: {
				name: 'John'
			},
			destroy: destroy
		};

		for (var i = 0; i < support.TYPES_EXCEPT_FUNCTION.length; i++) {
			test.throws(
				function () {
					instance.destroy(support.TYPES_EXCEPT_FUNCTION[i]);
				},
				errors.IllegalArgumentError,
				'Should fail on ' + support.TYPES_EXCEPT_FUNCTION[i]
			);
		}

		test.done();
	},
	softDeleteTimestamps: function (test) {
//		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			destroy: destroy,
			constructor: {
				connection: {},
				timestamps: true,
				softDelete: true
			}
		};

		instance.constructor.connection.run = function (query, next) {
			next(null, {
				cursor: 'test',
				new_val: {
					name: 'John'
				},
				errors: 0
			});
		};

		instance.destroy(function (err, instance, meta) {
			// These won't work until [this bug](https://github.com/caolan/async/pull/393) is fixed in the async library
//			test.ifError(err);
//			test.deepEqual(instance.attributes, {
//				name: 'John',
//				updated: 5,
//				deleted: 5
//			});
//			test.deepEqual(meta, {
//				cursor: 'test'
//			});
			test.done();
		});
	},
	softDelete: function (test) {
//		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			destroy: destroy,
			constructor: {
				connection: {},
				timestamps: false,
				softDelete: true
			}
		};

		instance.constructor.connection.run = function (query, next) {
			next(null, {
				cursor: 'test',
				new_val: {
					name: 'John'
				},
				errors: 0
			});
		};

		instance.destroy(function (err, instance, meta) {
			// These won't work until [this bug](https://github.com/caolan/async/pull/393) is fixed in the async library
//			test.ifError(err);
//			test.deepEqual(instance.attributes, {
//				name: 'John',
//				updated: 5,
//				deleted: 5
//			});
//			test.deepEqual(meta, {
//				cursor: 'test'
//			});
			test.done();
		});
	},
	unhandledError: function (test) {
//		test.expect(1);

		var instance = {
			attributes: {
				name: 'John'
			},
			destroy: destroy,
			constructor: {
				connection: {},
				timestamps: true
			},
			isNew: function () {
				return false;
			}
		};

		instance.constructor.connection.run = function (query, next) {
			throw new Error();
		};

		instance.destroy(function (err, instance, meta) {
			// This won't work until [this bug](https://github.com/caolan/async/pull/393) is fixed in the async library
//			test.equal(err.type, 'UnhandledError');
			test.done();
		});
	}
};
