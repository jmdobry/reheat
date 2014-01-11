/*jshint loopfunc:true*/

var utils = require('../../../../build/instrument/lib/support/utils'),
	Connection = require('../../../../build/instrument/lib/connection'),
	Model = require('../../../../build/instrument/lib/model'),
	r = require('rethinkdb'),
	connection = new Connection(),
	tableName = 'save';

exports.saveIntegration = {
	setUp: function (cb) {
		connection.run(r.tableList(), function (err, tableList) {
			if (err) {
				cb(err);
			} else {
				var connectionTableExists = false;
				for (var i = 0; i < tableList.length; i++) {
					if (tableList[i] === tableName) {
						connectionTableExists = true;
					}
				}
				if (!connectionTableExists) {
					connection.run(r.tableCreate(tableName), function (err) {
						if (err) {
							cb(err);
						} else {
							cb();
						}
					});
				} else {
					connection.run(r.table(tableName).delete(), function (err) {
						if (err) {
							cb(err);
						} else {
							cb();
						}
					});
				}
			}
		});
	},

	tearDown: function (cb) {
		connection.run(r.tableList(), function (err, tableList) {
			if (err) {
				cb(err);
			} else {
				var connectionTableExists = false;
				for (var i = 0; i < tableList.length; i++) {
					if (tableList[i] === tableName) {
						connectionTableExists = true;
					}
				}
				if (!connectionTableExists) {
					cb();
				} else {
					connection.run(r.table(tableName).delete(), function (err) {
						if (err) {
							cb(err);
						} else {
							cb();
						}
					});
				}
			}
		});
	},
	saveNew: function (test) {
		test.expect(5);

		var Post = Model.extend(null, {
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
			test.done();
		});
	},
	saveNewWithTimestamps: function (test) {
		test.expect(9);

		var Post = Model.extend(null, {
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
			test.done();
		});
	},
	saveExisting: function (test) {
		test.expect(13);

		var Post = Model.extend(null, {
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
					test.done();
				});
			});
		});
	},
	saveExistingWithTimestamps: function (test) {
		test.expect(19);

		var Post = Model.extend(null, {
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
					test.done();
				});
			});
		});
	}
};
