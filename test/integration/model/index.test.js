/*jshint loopfunc:true*/

var Connection = require('../../../build/instrument/lib/connection'),
	Model = require('../../../build/instrument/lib/model'),
	r = require('rethinkdb'),
	sinon = require('sinon'),
	connection = new Connection(),
	tableName = 'lifecycle';

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
	createLifecycle: function (test) {
		test.expect(9);

		var Post = Model.extend({
			beforeValidate: function (cb) {
				cb(null);
			},
			afterValidate: function (cb) {
				cb(null);
			},
			beforeCreate: function (cb) {
				cb(null);
			},
			afterCreate: function (instance, meta, cb) {
				cb(null, instance, meta);
			}
		}, {
			tableName: tableName,
			connection: connection
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

		post.save(function (err, post, meta) {
			test.ifError(err);
			test.deepEqual(post.get('author'), 'John Anderson');
			test.deepEqual(post.get('address.state'), 'NY');
			test.ok(typeof post.get('id') === 'string');
			test.equal(meta.inserted, 1);
			test.equal(post.beforeValidate.callCount, 1);
			test.equal(post.afterValidate.callCount, 1);
			test.equal(post.beforeCreate.callCount, 1);
			test.equal(post.afterCreate.callCount, 1);
			test.done();
		});
	}
};
