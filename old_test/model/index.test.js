/*jshint loopfunc:true*/

var Connection = require('../../../build/instrument/lib/connection'),
	reheat = require('../../../build/instrument/lib'),
	r = require('rethinkdb'),
	mout = require('mout'),
	sinon = require('sinon'),
	connection,
	tableName = 'lifecycle';

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
	createLifecycle: function (test) {
		test.expect(9);

		var Post = reheat.defineModel('Post', {
			tableName: tableName,
			connection: connection
		}, {
			beforeValidate: function (cb) {
				cb(null);
			},
			afterValidate: function (cb) {
				cb(null);
			},
			beforeCreate: function (cb) {
				cb(null);
			},
			afterCreate: function (instance, cb) {
				cb(null, instance);
			}
		});

		var post = new Post({
			author: 'John Anderson',
			address: {
				state: 'NY'
			}
		});

		sinon.spy(post, 'beforeValidate');
		sinon.spy(post, 'afterValidate');
		sinon.spy(post, 'beforeCreate');
		sinon.spy(post, 'afterCreate');

		post.save(function (err, post) {
			test.ifError(err);
			test.deepEqual(post.get('author'), 'John Anderson');
			test.deepEqual(post.get('address.state'), 'NY');
			test.ok(typeof post.get('id') === 'string');
			test.equal(post.meta.inserted, 1);
			test.equal(post.beforeValidate.callCount, 1);
			test.equal(post.afterValidate.callCount, 1);
			test.equal(post.beforeCreate.callCount, 1);
			test.equal(post.afterCreate.callCount, 1);
			reheat.unregisterModel('Post');
			test.done();
		});
	}
};
