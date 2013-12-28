/*jshint loopfunc:true*/

var SandboxedModule = require('sandboxed-module'),
	errors = require('../../../../build/instrument/lib/support/errors'),
	support = require('../../../support/support'),
	async = require('async'),
	save = SandboxedModule.require('../../../../build/instrument/lib/model/prototype/save', {
		requires: {
			'../../support/utils': require('../../../../build/instrument/lib/support/utils'), // Real dependency
			'../../support/errors': errors, // Real dependency
			rethinkdb: {
				table: function () {
					return {
						insert: function (attrs, options) {
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

exports.save = {
	normal: function (test) {
//		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			save: save,
			constructor: {
				connection: {},
				timestamps: false
			},
			isNew: function () {
				return true;
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

		instance.save(function (err, instance, meta) {
			// These won't work until [this bug](https://github.com/caolan/async/pull/393) is fixed in the async library
//			test.ifError(err);
//			test.deepEqual(instance.attributes, {
//				name: 'John'
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
			save: save
		};

		for (var i = 0; i < support.TYPES_EXCEPT_FUNCTION.length; i++) {
			test.throws(
				function () {
					instance.save(support.TYPES_EXCEPT_FUNCTION[i]);
				},
				errors.IllegalArgumentError,
				'Should fail on ' + support.TYPES_EXCEPT_FUNCTION[i]
			);
		}

		test.done();
	},
	timestampsIsNew: function (test) {
//		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			save: save,
			constructor: {
				connection: {},
				timestamps: true
			},
			isNew: function () {
				return true;
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

		instance.save(function (err, instance, meta) {
			// These won't work until [this bug](https://github.com/caolan/async/pull/393) is fixed in the async library
//			test.ifError(err);
//			test.deepEqual(instance.attributes, {
//				name: 'John',
//				updated: 5,
//				created: 5,
//				deleted: null
//			});
//			test.deepEqual(meta, {
//				cursor: 'test'
//			});
			test.done();
		});
	},
	timestampsNotNew: function (test) {
//		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			save: save,
			constructor: {
				connection: {},
				timestamps: true
			},
			isNew: function () {
				return false;
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

		instance.save(function (err, instance, meta) {
			// These won't work until [this bug](https://github.com/caolan/async/pull/393) is fixed in the async library
//			test.ifError(err);
//			test.deepEqual(instance.attributes, {
//				name: 'John',
//				updated: 5,
//				created: 5,
//				deleted: null
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
			save: save,
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

		instance.save(function (err, instance, meta) {
			// This won't work until [this bug](https://github.com/caolan/async/pull/393) is fixed in the async library
//			test.equal(err.type, 'UnhandledError');
			test.done();
		});
	}
};
