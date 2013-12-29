/*jshint loopfunc:true*/

var Model = require('../../../build/instrument/lib/model'),
	errors = require('../../../build/instrument/lib/support/errors'),
	support = require('../../support/support'),
	Connection = require('../../../build/instrument/lib/connection'),
	sinon = require('sinon');

exports.index = {
	methodsExist: function (test) {
		test.expect(31);

		test.ok(typeof Model.extend, 'function');
		test.ok(typeof Model.get, 'function');
		test.ok(typeof Model.getAll, 'function');
		test.ok(typeof Model.filter, 'function');
		test.ok(typeof Model.count, 'function');
		test.ok(typeof Model.sum, 'function');
		test.ok(typeof Model.avg, 'function');

		test.ok(typeof Model.prototype.initialize, 'function');
		test.ok(typeof Model.prototype.escape, 'function');
		test.ok(typeof Model.prototype.toJSON, 'function');
		test.ok(typeof Model.prototype.functions, 'function');
		test.ok(typeof Model.prototype.get, 'function');
		test.ok(typeof Model.prototype.has, 'function');
		test.ok(typeof Model.prototype.hasOwn, 'function');
		test.ok(typeof Model.prototype.set, 'function');
		test.ok(typeof Model.prototype.setSync, 'function');
		test.ok(typeof Model.prototype.unset, 'function');
		test.ok(typeof Model.prototype.clear, 'function');
		test.ok(typeof Model.prototype.clone, 'function');
		test.ok(typeof Model.prototype.isNew, 'function');
		test.ok(typeof Model.prototype.save, 'function');
		test.ok(typeof Model.prototype.destroy, 'function');
		test.ok(typeof Model.prototype.beforeValidate, 'function');
		test.ok(typeof Model.prototype.afterValidate, 'function');
		test.ok(typeof Model.prototype.validate, 'function');
		test.ok(typeof Model.prototype.beforeCreate, 'function');
		test.ok(typeof Model.prototype.afterCreate, 'function');
		test.ok(typeof Model.prototype.beforeUpdate, 'function');
		test.ok(typeof Model.prototype.afterUpdate, 'function');
		test.ok(typeof Model.prototype.beforeDestroy, 'function');
		test.ok(typeof Model.prototype.afterDestroy, 'function');

		test.done();
	},
	extend: function (test) {
		test.expect(42);

		for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					Model.extend(null, {
						idAttribute: support.TYPES_EXCEPT_STRING[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		for (i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					Model.extend(null, {
						tableName: support.TYPES_EXCEPT_STRING[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		for (i = 0; i < support.TYPES_EXCEPT_BOOLEAN.length; i++) {
			test.throws(
				function () {
					Model.extend(null, {
						timestamps: support.TYPES_EXCEPT_BOOLEAN[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		for (i = 0; i < support.TYPES_EXCEPT_BOOLEAN.length; i++) {
			test.throws(
				function () {
					Model.extend(null, {
						softDelete: support.TYPES_EXCEPT_BOOLEAN[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		test.throws(
			function () {
				Model.extend(null, {});
			},
			errors.IllegalArgumentError
		);

		var connection = new Connection();

		for (i = 0; i < support.TYPES_EXCEPT_BOOLEAN.length; i++) {
			if (!support.TYPES_EXCEPT_BOOLEAN[i]) {
				continue;
			}
			test.throws(
				function () {
					Model.extend(null, {
						schema: support.TYPES_EXCEPT_BOOLEAN[i],
						connection: connection
					});
				},
				errors.IllegalArgumentError
			);
		}
		test.doesNotThrow(
			function () {
				Model.extend(null, {
					connection: connection
				});
			}
		);

		test.done();
	},
	constructor: function (test) {
		test.expect(4);

		var Post = Model.extend(null, {
			connection: new Connection()
		});

		sinon.spy(Post.prototype, 'initialize');

		var post = new Post({
			name: 'John',
			address: {
				state: 'NY'
			}
		});

		test.equal(Post.prototype.initialize.callCount, 1);
		test.deepEqual(post.attributes, {
			name: 'John',
			address: {
				state: 'NY'
			}
		});
		test.deepEqual(post.changed, null);
		test.deepEqual(post.validationError, null);

		test.done();
	},
	prototype: function (test) {
		test.expect(2);

		var Post = Model.extend({
			initialize: function () {
				this.attributes.name = 'John';
			}
		}, {
			connection: new Connection()
		});

		sinon.spy(Post.prototype, 'initialize');

		var post = new Post();

		test.equal(Post.prototype.initialize.callCount, 1);
		test.deepEqual(post.attributes, {
			name: 'John'
		});

		test.done();
	}
};
