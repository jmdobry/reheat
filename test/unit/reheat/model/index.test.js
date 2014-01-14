/*jshint loopfunc:true*/

var reheat = require('../../../../build/instrument/lib'),
	Model = require('../../../../build/instrument/lib/model'),
	Connection = require('../../../../build/instrument/lib/connection'),
	sinon = require('sinon');

exports.index = {
	methodsExist: function (test) {
		test.expect(30);

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
	constructor: function (test) {
		test.expect(4);

		var Post = reheat.defineModel('Post', {
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

		reheat.unregisterModel('Post');
		test.done();
	},
	prototype: function (test) {
		test.expect(2);

		var Post = reheat.defineModel('Post', {
			connection: new Connection()
		}, {
			initialize: function () {
				this.attributes.name = 'John';
			}
		});

		sinon.spy(Post.prototype, 'initialize');

		var post = new Post();

		test.equal(Post.prototype.initialize.callCount, 1);
		test.deepEqual(post.attributes, {
			name: 'John'
		});

		reheat.unregisterModel('Post');

		test.done();
	}
};
