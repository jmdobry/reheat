/*jshint loopfunc:true*/

var utils = require('../../../../build/instrument/lib/support/utils'),
	Connection = require('../../../../build/instrument/lib/connection'),
	reheat = require('../../../../build/instrument/lib'),
	r = require('rethinkdb'),
	mout = require('mout'),
	connection,
	tableName = 'save';

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
	saveNew: function (test) {
		test.expect(5);

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

		post.save(function (err, post) {
			test.ifError(err);
			test.deepEqual(post.get('author'), 'John Anderson');
			test.deepEqual(post.get('address.state'), 'NY');
			test.ok(typeof post.get('id') === 'string');
			test.equal(post.meta.inserted, 1);
			reheat.unregisterModel('Post');
			test.done();
		});
	},
	saveNewWithTimestamps: function (test) {
		test.expect(9);

		var Post = reheat.defineModel('Post', {
			tableName: tableName,
			connection: connection,
			timestamps: true
		});

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
			test.ok(typeof post.get('id') === 'string');
			test.ok(utils.isDate(post.get('created')));
			test.ok(utils.isDate(post.get('updated')));
			test.deepEqual(post.get('updated'), post.get('created'));
			test.deepEqual(post.get('deleted'), null);
			test.equal(post.meta.inserted, 1);
			reheat.unregisterModel('Post');
			test.done();
		});
	},
	saveExisting: function (test) {
		test.expect(13);

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
			post.set({ author: 'Sally Johnson', address: { state: 'CO' } }, function (err) {
				test.ifError(err);
				test.deepEqual(post.get('author'), 'Sally Johnson');
				test.deepEqual(post.get('address.state'), 'CO');
				post.save(function (err, post) {
					test.ifError(err);
					test.deepEqual(post.get('author'), 'Sally Johnson');
					test.deepEqual(post.get('address.state'), 'CO');
					test.equal(post.meta.replaced, 1);
					test.deepEqual(post.get('id'), id);
					reheat.unregisterModel('Post');
					test.done();
				});
			});
		});
	},
	saveExistingWithTimestamps: function (test) {
		test.expect(19);

		var Post = reheat.defineModel('Post', {
			tableName: tableName,
			connection: connection,
			timestamps: true
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
			test.ok(utils.isDate(post.get('created')));
			test.ok(utils.isDate(post.get('updated')));
			test.deepEqual(post.get('updated'), post.get('created'));
			test.deepEqual(post.get('deleted'), null);
			test.equal(post.meta.inserted, 1);
			id = post.get(Post.idAttribute);
			post.set({ author: 'Sally Johnson', address: { state: 'CO' } }, function (err) {
				test.ifError(err);
				test.deepEqual(post.get('author'), 'Sally Johnson');
				test.deepEqual(post.get('address.state'), 'CO');
				post.save(function (err, post) {
					test.ifError(err);
					test.deepEqual(post.get('author'), 'Sally Johnson');
					test.deepEqual(post.get('address.state'), 'CO');
					test.equal(post.meta.replaced, 1);
					test.deepEqual(post.get('id'), id);
					test.ok(post.get('created') !== post.get('updated'));
					test.ok(post.get('updated') > post.get('created'));
					reheat.unregisterModel('Post');
					test.done();
				});
			});
		});
	}
};
