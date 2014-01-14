var static = require('../../../../../build/instrument/lib/model/static');

exports.static = {
	test: function (test) {
		test.expect(6);

		test.equal(static.idAttribute, 'id');
		test.equal(static.tableName, 'test');
		test.equal(static.timestamps, false);
		test.equal(static.softDelete, false);
		test.equal(static.connection, null);
		test.equal(static.schema, null);
		test.done();
	}
};
