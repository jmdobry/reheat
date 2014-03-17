/*jshint loopfunc:true*/

var utils = require('../../../../build/instrument/lib/support/utils'),
	Connection = require('../../../../build/instrument/lib/connection'),
	reheat = require('../../../../build/instrument/lib'),
	r = require('rethinkdb'),
	mout = require('mout'),
	connection,
	tableName = 'destroy';

exports.saveIntegration = {
	setUp: function (cb) {
		connection = new Connection();
		connection.run(r.dbList())
			.then(function (dbList) {
				if (mout.array.contains(dbList, 'test')) {
					return connection.run(r.dbDrop('test'));
				} else {
					return null;
				}
			})
			.then(function () {
				return connection.drain(function () {
					connection.destroyAllNow();

					connection = new Connection();
					return connection.run(r.tableCreate(tableName), function (err) {
						if (err) {
							cb(err);
						} else {
							cb();
						}
					});
				});
			})
			.catch(cb)
			.error(cb);
	},

	tearDown: function (cb) {
		connection.run(r.dbList())
			.then(function (dbList) {
				if (mout.array.contains(dbList, 'test')) {
					return connection.run(r.dbDrop('test'));
				}
				return null;
			})
			.then(function () {
				connection.drain(function () {
					connection.destroyAllNow();
					cb();
				});
			})
			.catch(cb)
			.error(cb);
	},
	tryToDestroyNew: function (test) {
		test.expect(4);

		var Post = reheat.defineModel('Post', {
			tableName: tableName,
			connection: connection
		});

		var post = new Post({
			author: 'John Anderson',
			address: {
				state: 'NY'
			}
		});

		post.destroy(function (err, post) {
			test.ifError(err);
			test.deepEqual(post.get('author'), 'John Anderson');
			test.deepEqual(post.get('address.state'), 'NY');
			test.equal(post.meta, undefined);
			reheat.unregisterModel('Post');
			test.done();
		});
	},
	destroyExisting: function (test) {
		test.expect(14);

		var Post = reheat.defineModel('Post', {
			tableName: tableName,
			connection: connection
		});

		var id;

		var post = new Post({
			author: 'John Anderson',
			address: {
				state: 'NY'
			}
		});

		post.save(function (err, post) {
			test.ifError(err);
			test.deepEqual(post.get('author'), 'John Anderson');
			test.deepEqual(post.get('address.state'), 'NY');
			test.ok(typeof post.get(Post.idAttribute) === 'string');
			test.equal(post.meta.inserted, 1);
			id = post.get(Post.idAttribute);
			post.destroy(function (err, post) {
				test.ifError(err);
				test.deepEqual(post.get('author'), 'John Anderson');
				test.deepEqual(post.get('address.state'), 'NY');
				test.equal(post.meta.deleted, 1);
				test.deepEqual(post.get('id'), undefined);
				test.deepEqual(post.toJSON(), {
					author: 'John Anderson',
					address: {
						state: 'NY'
					}
				});
				test.deepEqual(post.previousAttributes, {
					author: 'John Anderson',
					address: {
						state: 'NY'
					},
					id: id
				});
				connection.run(r.table(tableName).get(id), function (err, post) {
					test.ifError(err);
					test.deepEqual(post, null);
					reheat.unregisterModel('Post');
					test.done();
				});
			});
		});
	},
	destroyExistingWithTimestampsAndSoftDelete: function (test) {
		test.expect(12);

		var Post = reheat.defineModel('Post', {
			tableName: tableName,
			connection: connection,
			timestamps: true,
			softDelete: true
		});

		var id;

		var post = new Post({
			author: 'John Anderson',
			address: {
				state: 'NY'
			}
		});

		post.save(function (err, post) {
			test.ifError(err);
			test.deepEqual(post.get('author'), 'John Anderson');
			test.deepEqual(post.get('address.state'), 'NY');
			test.ok(typeof post.get(Post.idAttribute) === 'string');
			test.equal(post.meta.inserted, 1);
			id = post.get(Post.idAttribute);
			post.destroy(function (err, post) {
				test.ifError(err);
				test.deepEqual(post.get('author'), 'John Anderson');
				test.deepEqual(post.get('address.state'), 'NY');
				test.equal(post.meta.replaced, 1);
				test.ok(utils.isDate(post.get('deleted')));
				test.ok(post.get('created') !== post.get('updated'));
				test.ok(post.get('updated').getTime() === post.get('deleted').getTime());
				reheat.unregisterModel('Post');
				test.done();
			});
		});
	},
	destroyExistingWithSoftDelete: function (test) {
		test.expect(10);

		var Post = reheat.defineModel('Post', {
			tableName: tableName,
			connection: connection,
			softDelete: true
		});

		var id;

		var post = new Post({
			author: 'John Anderson',
			address: {
				state: 'NY'
			}
		});

		post.save(function (err, post) {
			test.ifError(err);
			test.deepEqual(post.get('author'), 'John Anderson');
			test.deepEqual(post.get('address.state'), 'NY');
			test.ok(typeof post.get(Post.idAttribute) === 'string');
			test.equal(post.meta.inserted, 1);
			id = post.get(Post.idAttribute);
			post.destroy(function (err, post) {
				test.ifError(err);
				test.deepEqual(post.get('author'), 'John Anderson');
				test.deepEqual(post.get('address.state'), 'NY');
				test.equal(post.meta.replaced, 1);
				test.ok(utils.isDate(post.get('deleted')));
				reheat.unregisterModel('Post');
				test.done();
			});
		});
	}
};
