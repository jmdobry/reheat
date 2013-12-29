/*jshint loopfunc:true*/

var getAll = require('../../../../build/instrument/lib/model/static/getAll'),
	errors = require('../../../../build/instrument/lib/support/errors'),
	support = require('../../../support/support');

exports.getAll = {
	normal: function (test) {
		test.expect(2);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;
		Model.connection = {
			run: function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' }
						]);
					}
				});
			}
		};

		Model.getAll('5', 'id', function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.done();
		});
	},
	profile: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;
		Model.connection = {
			run: function (query, options, next) {
				next(null, {
					profile: {},
					value: {
						toArray: function (cb) {
							cb(null, [
								{ id: 5, name: 'John' },
								{ id: 6, name: 'Sally' }
							]);
						}
					}
				});
			}
		};

		Model.getAll(['5', '6'], 'id', { profile: true }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			test.done();
		});
	},
	normalKeyArray: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;
		Model.connection = {
			run: function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' },
							{ id: 6, name: 'Sally' }
						]);
					}
				});
			}
		};

		Model.getAll(['5', '6'], 'id', function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			test.done();
		});
	},
	raw: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;
		Model.connection = {
			run: function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' },
							{ id: 6, name: 'Sally' }
						]);
					}
				});
			}
		};

		Model.getAll(['5', '6'], { index: 'id' }, { raw: true }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0], { id: 5, name: 'John' });
			test.deepEqual(instances[1], { id: 6, name: 'Sally' });
			test.done();
		});
	},
	noCallback: function (test) {
		test.expect(1);

		function Model() {
		}

		Model.getAll = getAll;

		test.throws(
			function () {
				Model.getAll('5', 'id');
			},
			errors.InvalidArgumentError,
			'Should fail with no callback'
		);

		test.done();
	},
	primaryKey: function (test) {
		test.expect(8);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;
		Model.connection = {
			run: function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' },
							{ id: 6, name: 'Sally' }
						]);
					}
				});
			}
		};

		for (var i = 0; i < support.TYPES_EXCEPT_STRING_OR_ARRAY.length; i++) {
			Model.getAll(support.TYPES_EXCEPT_STRING_OR_ARRAY[i], { index: 'id' }, function (err) {
				test.equal(err.type, 'IllegalArgumentError');
			});
		}

		test.done();
	},
	index: function (test) {
		test.expect(8);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;
		Model.connection = {
			run: function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' },
							{ id: 6, name: 'Sally' }
						]);
					}
				});
			}
		};

		for (var i = 0; i < support.TYPES_EXCEPT_STRING_OR_OBJECT.length; i++) {
			Model.getAll('5', support.TYPES_EXCEPT_STRING_OR_OBJECT[i], function (err) {
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
		Model.getAll = getAll;
		Model.connection = {
			run: function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			}
		};

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (!support.TYPES_EXCEPT_OBJECT[i] || typeof support.TYPES_EXCEPT_OBJECT[i] === 'function') {
				continue;
			}
			Model.getAll('5', 'id', support.TYPES_EXCEPT_OBJECT[i], function (err) {
				test.equal(err.type, 'IllegalArgumentError');
			});
		}

		test.done();
	},
	unhandledError: function (test) {
		test.expect(1);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;
		Model.connection = {
			run: function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(new Error());
					}
				});
			}
		};

		Model.getAll('5', 'id', function (err) {
			test.equal(err.type, 'UnhandledError');
			test.done();
		});
	},
	unhandledError2: function (test) {
		test.expect(1);

		getAll('5', 'id', function (err) {
			test.equal(err.type, 'UnhandledError');
			test.done();
		});
	}
};
