/*jshint loopfunc:true*/

var get = require('../../../../build/instrument/lib/model/static/get'),
	errors = require('../../../../build/instrument/lib/support/errors'),
	support = require('../../../support/support');

exports.get = {
	normal: function (test) {
		test.expect(2);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			}
		};

		Model.get('5', function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, { id: 5, name: 'John' });
			test.done();
		});
	},
	profile: function (test) {
		test.expect(2);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: function (query, options, next) {
				next(null, { profile: {}, value: { id: 5, name: 'John' } });
			}
		};

		Model.get('5', { profile: true }, function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, { id: 5, name: 'John' });
			test.done();
		});
	},
	null: function (test) {
		test.expect(2);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: function (query, options, next) {
				next(null, null);
			}
		};

		Model.get('5', function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance, null);
			test.done();
		});
	},
	raw: function (test) {
		test.expect(2);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			}
		};

		Model.get('5', { raw: true }, function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance, { id: 5, name: 'John' });
			test.done();
		});
	},
	noCallback: function (test) {
		test.expect(1);

		function Model() {
		}

		Model.get = get;

		test.throws(
			function () {
				Model.get('5');
			},
			errors.InvalidArgumentError,
			'Should fail with no callback'
		);

		test.done();
	},
	primaryKey: function (test) {
		test.expect(9);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			}
		};

		for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			Model.get(support.TYPES_EXCEPT_STRING[i], {}, function (err) {
				test.equal(err.type, 'IllegalArgumentError');
			});
		}

		test.done();
	},
	options: function (test) {
		test.expect(4);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			}
		};

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (!support.TYPES_EXCEPT_OBJECT[i] || typeof support.TYPES_EXCEPT_OBJECT[i] === 'function') {
				continue;
			}
			Model.get('5', support.TYPES_EXCEPT_OBJECT[i], function (err) {
				test.equal(err.type, 'IllegalArgumentError');
			});
		}

		test.done();
	},
	unhandledError: function (test) {
		test.expect(2);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: function (query, options, next) {
				next(new Error());
			}
		};

		Model.get('5', function (err) {
			test.equal(err.type, 'UnhandledError');

			get('5', function (err) {
				test.equal(err.type, 'UnhandledError');
				test.done();
			});
		});
	}
};
