/*jshint loopfunc:true*/

var SandboxedModule = require('sandboxed-module'),
	errors = require('../../../../../build/instrument/lib/support/errors'),
	Promise = require('bluebird'),
	destroy = SandboxedModule.require('../../../../../build/instrument/lib/model/prototype/destroy', {
		requires: {
			'../../support/utils': require('../../../../../build/instrument/lib/support/utils'), // Real dependency
			'../../support/errors': errors, // Real dependency
			rethinkdb: {
				table: function () {
					return {
						get: function () {
							return {
								update: function () {
								},
								delete: function () {
								}
							};
						}
					};
				},
				now: function () {
					return 5;
				}
			}
		}
	}),
	mout = require('mout');

var lifecycleFunctions = {
	beforeDestroy: function (cb) {
//		console.log('beforeDestroy');
		cb();
	},
	afterDestroy: function (instance, cb) {
//		console.log('afterDestroy');
		cb(null, instance);
	}
};

exports.destroyTest = {
	normal: function (test) {
		test.expect(7);

		var instance = {
			attributes: {
				name: 'John',
				id: 2
			},
			destroy: destroy,
			constructor: {
				connection: {},
				timestamps: false,
				idAttribute: 'id',
				tableReady: Promise.resolve()
			},
			isNew: function () {
				return false;
			},
			get: function () {
				return 'id';
			}
		};

		mout.object.deepMixIn(instance, lifecycleFunctions);

		instance.constructor.connection.run = Promise.promisify(function (query, options, next) {
			next(null, {
				old_val: {
					name: 'John',
					id: 2
				},
				deleted: 1,
				errors: 0
			});
		});

		instance.destroy(function (err, instance) {
			console.log(err);
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				name: 'John'
			});
			test.deepEqual(instance.previousAttributes, {
				name: 'John',
				id: 2
			});
			test.deepEqual(instance.meta, {
				old_val: {
					name: 'John',
					id: 2
				},
				deleted: 1,
				errors: 0
			});
			instance.destroy().then(function (instance) {
				test.deepEqual(instance.attributes, {
					name: 'John'
				});
				test.deepEqual(instance.previousAttributes, {
					name: 'John',
					id: 2
				});
				test.deepEqual(instance.meta, {
					old_val: {
						name: 'John',
						id: 2
					},
					deleted: 1,
					errors: 0
				});
				test.done();
			});
		});
	},

	normalIsNew: function (test) {
		test.expect(3);

		var instance = {
			attributes: {
				name: 'John'
			},
			destroy: destroy,
			constructor: {
				connection: {},
				timestamps: false,
				idAttribute: 'id',
				tableReady: Promise.resolve()
			},
			isNew: function () {
				return true;
			}
		};

		mout.object.deepMixIn(instance, lifecycleFunctions);

		instance.destroy(function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				name: 'John'
			});
			instance.destroy().then(function (instance) {
				test.deepEqual(instance.attributes, {
					name: 'John'
				});
				test.done();
			});
		});
	},
	softDeleteTimestamps: function (test) {
		test.expect(7);

		var instance = {
			attributes: {
				name: 'John',
				id: 2
			},
			destroy: destroy,
			constructor: {
				connection: {},
				timestamps: true,
				softDelete: true,
				tableReady: Promise.resolve()
			},
			isNew: function () {
				return false;
			},
			get: function () {
				return 2;
			}
		};

		mout.object.deepMixIn(instance, lifecycleFunctions);

		instance.constructor.connection.run = Promise.promisify(function (query, options, next) {
			next(null, {
				old_val: {
					name: 'John',
					id: 2,
					updated: 5,
					deleted: null
				},
				new_val: {
					name: 'John',
					id: 2,
					updated: 5,
					deleted: 5
				},
				errors: 0
			});
		});

		instance.destroy(function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				name: 'John',
				id: 2,
				updated: 5,
				deleted: 5
			});
			test.deepEqual(instance.previousAttributes, {
				name: 'John',
				id: 2,
				updated: 5,
				deleted: null
			});
			test.deepEqual(instance.meta, {
				old_val: {
					name: 'John',
					id: 2,
					updated: 5,
					deleted: null
				},
				new_val: {
					name: 'John',
					id: 2,
					updated: 5,
					deleted: 5
				},
				errors: 0
			});
			instance.destroy().then(function (instance) {
				test.deepEqual(instance.attributes, {
					name: 'John',
					id: 2,
					updated: 5,
					deleted: 5
				});
				test.deepEqual(instance.previousAttributes, {
					name: 'John',
					id: 2,
					updated: 5,
					deleted: null
				});
				test.deepEqual(instance.meta, {
					old_val: {
						name: 'John',
						id: 2,
						updated: 5,
						deleted: null
					},
					new_val: {
						name: 'John',
						id: 2,
						updated: 5,
						deleted: 5
					},
					errors: 0
				});
				test.done();
			});
		});
	},
	softDelete: function (test) {
		test.expect(7);

		var instance = {
			attributes: {
				name: 'John',
				id: 2
			},
			destroy: destroy,
			constructor: {
				connection: {},
				timestamps: false,
				softDelete: true,
				tableReady: Promise.resolve()
			},
			isNew: function () {
				return false;
			},
			get: function () {
				return 2;
			}
		};

		mout.object.deepMixIn(instance, lifecycleFunctions);

		instance.constructor.connection.run = Promise.promisify(function (query, options, next) {
			next(null, {
				old_val: {
					name: 'John',
					id: 2
				},
				new_val: {
					name: 'John',
					id: 2,
					deleted: 5
				},
				errors: 0
			});
		});

		instance.destroy(function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, {
				name: 'John',
				id: 2,
				deleted: 5
			});
			test.deepEqual(instance.previousAttributes, {
				name: 'John',
				id: 2
			});
			test.deepEqual(instance.meta, {
				old_val: {
					name: 'John',
					id: 2
				},
				new_val: {
					name: 'John',
					id: 2,
					deleted: 5
				},
				errors: 0
			});
			instance.destroy().then(function (instance) {
				test.deepEqual(instance.attributes, {
					name: 'John',
					id: 2,
					deleted: 5
				});
				test.deepEqual(instance.previousAttributes, {
					name: 'John',
					id: 2
				});
				test.deepEqual(instance.meta, {
					old_val: {
						name: 'John',
						id: 2
					},
					new_val: {
						name: 'John',
						id: 2,
						deleted: 5
					},
					errors: 0
				});
				test.done();
			});
		});
	}
};
