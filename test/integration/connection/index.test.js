/*jshint loopfunc:true*/

var Connection = require('../../../build/instrument/lib/connection'),
	r = require('rethinkdb'),
	connection = new Connection(),
	tableName = 'connection';

exports.ConnectionIntegration = {
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
	insert: function (test) {
		test.expect(4);

		connection.run(r.table(tableName).insert({
			test: 'insert'
		}, { return_vals: true }), function (err, cursor) {
			test.ifError(err);
			test.equal(cursor.new_val.test, 'insert');
			test.ok(cursor.new_val.hasOwnProperty('id'));
			test.equal(cursor.inserted, 1);
			test.done();
		});
	},
	manyInsert: function (test) {
		test.expect(4002);

		connection.configure({
			max: 100
		});
		var completed = 0;
		for (var i = 0; i < 1000; i++) {
			connection.run(r.table(tableName).insert({
				test: 'manyInsert'
			}, { return_vals: true }), function (err, cursor) {
				test.ifError(err);
				test.equal(cursor.new_val.test, 'manyInsert');
				test.ok(cursor.new_val.hasOwnProperty('id'));
				test.equal(cursor.inserted, 1);
				completed += 1;
			});
		}
		var interval;
		setTimeout(function () {
			interval = setInterval(function () {
				if (completed === 1000) {
					connection.run(r.table(tableName).count(), function (err, count) {
						test.ifError(err);
						test.ok(count >= 1000);
						clearInterval(interval);
						test.done();
					});
				}
			}, 100);
		}, 200);
	}
};
