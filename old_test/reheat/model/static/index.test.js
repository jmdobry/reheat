var s = require('../../../../../build/instrument/lib/model/static');

exports.static = {
	test: function (test) {
		test.expect(7);

		test.equal(s.idAttribute, 'id');
		test.equal(s.tableName, '');
		test.equal(s.timestamps, false);
		test.equal(s.softDelete, false);
		test.equal(s.connection, null);
		test.equal(s.relations, null);
		test.equal(s.schema, null);
		test.done();
	}
};
