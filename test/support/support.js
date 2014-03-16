var Connection = require('../../lib/connection'),
	mout = require('mout'),
	r = require('rethinkdb');

module.exports = {
	fail: function (msg) {
		assert.equal('should not reach this!: ' + msg, 'failure');
	},
	TYPES_EXCEPT_STRING: [123, 123.123, null, undefined, {}, [], true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_ARRAY: [123, 123.123, null, undefined, {}, true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_OBJECT: [123, 123.123, null, undefined, [], true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_NUMBER: [null, undefined, {}, [], true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_ARRAY_OR_NUMBER: [null, undefined, {}, true, false, function () {
	}],
	TYPES_EXCEPT_NUMBER: ['string', null, undefined, {}, [], true, false, function () {
	}],
	TYPES_EXCEPT_OBJECT: ['string', 123, 123.123, null, undefined, true, false, function () {
	}],
	TYPES_EXCEPT_BOOLEAN: ['string', 123, 123.123, null, undefined, {}, [], function () {
	}],
	TYPES_EXCEPT_FUNCTION: ['string', 123, 123.123, null, undefined, {}, [], true, false],
	ensureTableExists: function (tableName) {
		var connection = new Connection();

		return connection.run(r.tableList())
			.then(function (tableList) {
				if (!mout.array.contains(tableList, tableName)) {
					return connection.run(r.tableCreate(tableName));
				}
			})
			.then(function () {
				connection.drain().then(function () {
					connection.destroyAllNow();
				});
			});
	},
	ensureIndexExists: function (tableName, index) {
		var connection = new Connection();

		return connection.run(r.table(tableName).indexList())
			.then(function (indexList) {
				if (!mout.array.contains(indexList, index)) {
					return connection.run(r.table(tableName).indexCreate(index));
				}
			})
			.then(function () {
				connection.drain().then(function () {
					connection.destroyAllNow();
				});
			});
	}
};
