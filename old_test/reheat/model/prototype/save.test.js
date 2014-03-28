/*jshint loopfunc:true*/

var SandboxedModule = require('sandboxed-module'),
	errors = require('../../../../../build/instrument/lib/support/errors'),
	support = require('../../../../support/support'),
	Promise = require('bluebird'),
	now = function () {
		return 5;
	},
	save = SandboxedModule.require('../../../../../build/instrument/lib/model/prototype/save', {
		requires: {
			'../../support/utils': require('../../../../../build/instrument/lib/support/utils'), // Real dependency
			'../../support/errors': errors, // Real dependency
			rethinkdb: {
				table: function () {
					return {
						insert: function () {
						},
						get: function () {
							return {
								update: function () {

								}
							};
						},
						update: function () {

						}
					};
				},
				now: now
			}
		}
	}),
	mout = require('mout');

var lifecycleFunctions = {
	beforeValidate: function (cb) {
//		console.log('beforeValidate');
		cb();
	},
	validate: function (cb) {
//		console.log('validate');
		cb();
	},
	afterValidate: function (cb) {
//		console.log('afterValidate');
		cb();
	},
	beforeCreate: function (cb) {
//		console.log('beforeCreate');
		cb();
	},
	beforeUpdate: function (cb) {
//		console.log('beforeUpdate');
		cb();
	},
	afterCreate: function (instance, cb) {
//		console.log('afterCreate');
		cb(null, instance);
	},
	afterUpdate: function (instance, cb) {
//		console.log('afterUpdate');
		cb(null, instance);
	}
};

exports.save = {
	normal: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			save: save,
			constructor: {
				connection: {},
				timestamps: false,
				tableReady: Promise.resolve(),
				relations: {}
			},
			isNew: function () {
				return true;
			}
		};

		mout.object.deepMixIn(instance, lifecycleFunctions);

		instance.constructor.connection.run = Promise.promisify(function (query, options, next) {
			next(null, {
				new_val: {
					name: 'John'
				},
				inserted: 1,
				errors: 0
			});
		});

		instance.save(function (err, instance) {
			console.log(err);
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				name: 'John'
			});
			instance.save().then(function (instance) {
				test.deepEqual(instance.attributes, {
					name: 'John'
				});
				test.done();
			});
		});
	},
	timestampsIsNew: function (test) {
		test.expect(5);

		var instance = {
			attributes: {
				name: 'John'
			},
			save: save,
			constructor: {
				connection: {},
				timestamps: true,
				relations: {},
				tableReady: Promise.resolve()
			},
			isNew: function () {
				return true;
			},
			get: function () {
				return '5';
			}
		};

		mout.object.deepMixIn(instance, lifecycleFunctions);

		instance.constructor.connection.run = Promise.promisify(function (query, options, next) {
			next(null, {
				new_val: {
					name: 'John',
					updated: 5,
					created: 5,
					deleted: null
				},
				inserted: 1,
				errors: 0
			});
		});

		instance.save(function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				name: 'John',
				updated: 5,
				created: 5,
				deleted: null
			});
			test.deepEqual(instance.meta, {
				new_val: {
					name: 'John',
					updated: 5,
					created: 5,
					deleted: null
				},
				inserted: 1,
				errors: 0
			});
			instance.save().then(function (instance) {
				test.deepEqual(instance.attributes, {
					name: 'John',
					updated: 5,
					created: 5,
					deleted: null
				});
				test.deepEqual(instance.meta, {
					new_val: {
						name: 'John',
						updated: 5,
						created: 5,
						deleted: null
					},
					inserted: 1,
					errors: 0
				});
				test.done();
			});
		});
	},
	timestampsNotNew: function (test) {
		test.expect(5);

		var instance = {
			attributes: {
				name: 'John'
			},
			save: save,
			constructor: {
				connection: {},
				timestamps: true,
				relations: {},
				tableReady: Promise.resolve()
			},
			isNew: function () {
				return false;
			},
			get: function () {
				return '5';
			}
		};

		mout.object.deepMixIn(instance, lifecycleFunctions);

		instance.constructor.connection.run = Promise.promisify(function (query, options, next) {
			next(null, {
				new_val: {
					name: 'John',
					updated: 6,
					created: 5,
					deleted: null
				},
				errors: 0
			});
		});

		now = function () { return 6; };

		instance.save(function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				name: 'John',
				updated: 6,
				created: 5,
				deleted: null
			});
			test.deepEqual(instance.meta, {
				new_val: {
					name: 'John',
					updated: 6,
					created: 5,
					deleted: null
				},
				errors: 0
			});
			instance.save().then(function (instance) {
				test.deepEqual(instance.attributes, {
					name: 'John',
					updated: 6,
					created: 5,
					deleted: null
				});
				test.deepEqual(instance.meta, {
					new_val: {
						name: 'John',
						updated: 6,
						created: 5,
						deleted: null
					},
					errors: 0
				});
				now = function () { return 5; };
				test.done();
			});
		});
	},
	options: function (test) {
		test.expect(8);

		var instance = {
			attributes: {
				name: 'John'
			},
			save: save,
			constructor: {
				connection: {},
				relations: {},
				timestamps: true,
				tableReady: Promise.resolve()
			},
			isNew: function () {
				return true;
			}
		};

		mout.object.deepMixIn(instance, lifecycleFunctions);

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (support.TYPES_EXCEPT_OBJECT[i] && typeof support.TYPES_EXCEPT_OBJECT[i] !== 'function') {
				queue.push((function (j) {
					return instance.save(support.TYPES_EXCEPT_OBJECT[j]).then(function () {
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
	}
};
