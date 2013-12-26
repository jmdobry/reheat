//var Connection = require('../../../build/instrument/lib/connection');

var async = require('async'),
	SandboxedModule = require('sandboxed-module'),
	Connection = SandboxedModule.require('../../../build/instrument/lib/connection', {
		requires: {
			mout: require('mout'), // Real dependency
			'generic-pool': require('generic-pool'), // Real dependency
			rethinkdb: {
				connect: function (options, cb) {
					setTimeout(function () {
						cb(null, {
							close: function () {
							}
						});
					}, 100);
				}
			}, // Mock dependency
			async: async // Real dependency
		}
	});

exports.Connection = {
	setUp: function (cb) {
		this.connection = new Connection();
		cb();
	},

	tearDown: function (cb) {
		cb();
	},

	defaults: function (test) {
		test.expect(12);

		test.equal(this.connection.get('db'), 'test', 'Should have the default db');
		test.equal(this.connection.get('host'), 'localhost', 'Should have the default host');
		test.equal(this.connection.get('port'), 28015, 'Should have the default port');
		test.equal(this.connection.get('authKey'), '', 'Should have the default authKey');

		test.equal(this.connection.get('max'), 1, 'Should have the default max');
		test.equal(this.connection.get('min'), 0, 'Should have the default min');
		test.equal(this.connection.get('name'), '', 'Should have the default name');
		test.equal(this.connection.get('log'), false, 'Should have the default log');
		test.equal(this.connection.get('idleTimeoutMillis'), 30000, 'Should have the default idleTimeoutMillis');
		test.equal(this.connection.get('refreshIdle'), true, 'Should have the default refreshIdle');
		test.equal(this.connection.get('reapIntervalMillis'), 1000, 'Should have the default reapIntervalMillis');
		test.equal(this.connection.get('priorityRange'), 1, 'Should have the default priorityRange');

		test.done();
	},

	configure: function (test) {
		test.expect(4);

		this.connection.configure({
			db: 'different',
			host: 'different',
			port: 1111,
			authKey: 'secret'
		});

		test.equal(this.connection.get('db'), 'different', 'Should have a different db');
		test.equal(this.connection.get('host'), 'different', 'Should have a different host');
		test.equal(this.connection.get('port'), 1111, 'Should have a different port');
		test.equal(this.connection.get('authKey'), 'secret', 'Should have a different authKey');

		test.done();
	},

	destroy: function (test) {
		test.expect(0);

		test.done();
	},

	acquire: function (test) {
		test.expect(0);

		test.done();
	},

	release: function (test) {
		test.expect(0);

		test.done();
	},

	drain: function (test) {
		test.expect(0);

		test.done();
	},

	destroyAllNow: function (test) {
		test.expect(0);

		test.done();
	},

	pooled: function (test) {
		test.expect(0);

		test.done();
	},

	getPoolSize: function (test) {
		var _this = this;

		test.expect(5);

		test.equal(this.connection.getPoolSize(), 0, 'Should start with an empty pool');

		this.connection.configure({
			max: 2
		});

		test.equal(this.connection.getPoolSize(), 0, 'Should still have an empty pool');

		this.connection.acquire(function (err, conn) {

			test.equal(_this.connection.getPoolSize(), 1, 'There should now be one resource in the pool');
			_this.connection.release(conn);
			test.equal(_this.connection.getPoolSize(), 1, 'There should still be one resource in the pool');

			async.parallel([
				function (cb) {
					_this.connection.acquire(function (err, conn) {
						setTimeout(function () {
							_this.connection.release(conn);
							cb();
						}, 100);
					});
				},
				function (cb) {
					_this.connection.acquire(function (err, conn) {
						setTimeout(function () {
							_this.connection.release(conn);
							cb();
						}, 100);
					});
				}
			], function (err, results) {
				test.equal(_this.connection.getPoolSize(), 2, 'There should now be two resources in the pool');
				test.done();
			});
		});
	},

	getName: function (test) {
		test.expect(2);

		test.equal(this.connection.getName(), '', 'Should have the default name');

		this.connection.configure({
			name: 'newName'
		});

		test.equal(this.connection.getName(), 'newName', 'Should have a different name');

		test.done();
	},

	availableObjectsCount: function (test) {
		var _this = this;

		test.expect(3);

		test.equal(this.connection.availableObjectsCount(), 0, 'Should not have anything available to start with');

		this.connection.acquire(function (err, conn) {

			test.equal(_this.connection.availableObjectsCount(), 0, 'Still should not have anything available to start with');
			_this.connection.release(conn);
			test.equal(_this.connection.availableObjectsCount(), 1, 'There should now be one available object');

			test.done();
		});
	},

	waitingClientsCount: function (test) {
		var _this = this;

		test.expect(3);

		test.equal(this.connection.waitingClientsCount(), 0, 'Should not have any clients waiting to start with');

		this.connection.acquire(function (err, conn) {

			test.equal(_this.connection.waitingClientsCount(), 0, 'Should no longer have any waiting clients');

			test.done();
		});

		test.equal(this.connection.waitingClientsCount(), 1, 'Should now have one waiting client');
	},

	run: function (test) {
		test.expect(0);

		test.done();
	}
};
