/*jshint loopfunc:true*/

var filter = require('../../../../build/instrument/lib/model/static/filter'),
	errors = require('../../../../build/instrument/lib/support/errors'),
	support = require('../../../support/support');

exports.filter = {
	normal: function (test) {
		test.expect(2);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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

		Model.filter({}, function (err, instances) {
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
		Model.filter = filter;
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

		Model.filter({ where: '{}' }, { profile: true }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			test.done();
		});
	},
	where: function (test) {
		test.expect(2);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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

		Model.filter({ where: { name: 'John' }}, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.done();
		});
	},
	whereError: function (test) {
		test.expect(10);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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
			if (typeof support.TYPES_EXCEPT_STRING_OR_OBJECT[i] === 'string' || !support.TYPES_EXCEPT_STRING_OR_OBJECT[i]) {
				continue;
			}
			Model.filter({ where: support.TYPES_EXCEPT_STRING_OR_OBJECT[i] }, function (err) {
				test.equal(err.type, 'IllegalArgumentError');
				test.deepEqual(err.errors, { where: { actual: typeof support.TYPES_EXCEPT_STRING_OR_OBJECT[i], expected: 'string|object' }});
			});
		}

		test.done();
	},
	orderBy: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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

		Model.filter({ orderBy: 'name'}, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			test.done();
		});
	},
	orderByArray: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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

		Model.filter({ orderBy: ['name', ['id', 'desc']]}, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			test.done();
		});
	},
	limit: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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

		Model.filter({ limit: 2 }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			test.done();
		});
	},
	limitError: function (test) {
		test.expect(8);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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

		for (var i = 0; i < support.TYPES_EXCEPT_NUMBER.length; i++) {
			if (typeof support.TYPES_EXCEPT_NUMBER[i] === 'string' || !support.TYPES_EXCEPT_NUMBER[i]) {
				continue;
			}
			Model.filter({ limit: support.TYPES_EXCEPT_NUMBER[i] }, function (err) {
				test.equal(err.type, 'IllegalArgumentError');
				test.deepEqual(err.errors, { limit: { actual: typeof support.TYPES_EXCEPT_NUMBER[i], expected: 'number' }});
			});
		}

		test.done();
	},
	skip: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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

		Model.filter({ skip: 2 }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			test.done();
		});
	},
	skipError: function (test) {
		test.expect(8);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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

		for (var i = 0; i < support.TYPES_EXCEPT_NUMBER.length; i++) {
			if (typeof support.TYPES_EXCEPT_NUMBER[i] === 'string' || !support.TYPES_EXCEPT_NUMBER[i]) {
				continue;
			}
			Model.filter({ skip: support.TYPES_EXCEPT_NUMBER[i] }, function (err) {
				test.equal(err.type, 'IllegalArgumentError');
				test.deepEqual(err.errors, { skip: { actual: typeof support.TYPES_EXCEPT_NUMBER[i], expected: 'number' }});
			});
		}

		test.done();
	},
	pluck: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
		Model.connection = {
			run: function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ name: 'John' },
							{ name: 'Sally' }
						]);
					}
				});
			}
		};

		Model.filter({ pluck: 'name' }, { raw: true }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0], { name: 'John' });
			test.deepEqual(instances[1], { name: 'Sally' });
			test.done();
		});
	},
	pluckMultiple: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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

		Model.filter({ pluck: ['name', 'id'] }, { raw: true }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0], { id: 5, name: 'John' });
			test.deepEqual(instances[1], { id: 6, name: 'Sally' });
			test.done();
		});
	},
	pluckError: function (test) {
		test.expect(10);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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
			if (!support.TYPES_EXCEPT_STRING_OR_ARRAY[i]) {
				continue;
			}
			Model.filter({ pluck: support.TYPES_EXCEPT_STRING_OR_ARRAY[i] }, { raw: true }, function (err) {
				test.equal(err.type, 'IllegalArgumentError');
				test.deepEqual(err.errors, { pluck: { actual: typeof support.TYPES_EXCEPT_STRING_OR_ARRAY[i], expected: 'string|array' }});
			});
		}

		test.done();
	},
	raw: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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

		Model.filter({}, { raw: true }, function (err, instances) {
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

		Model.filter = filter;

		test.throws(
			function () {
				Model.filter();
			},
			errors.InvalidArgumentError,
			'Should fail with no callback'
		);

		test.done();
	},
	predicate: function (test) {
		test.expect(5);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
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

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (!support.TYPES_EXCEPT_OBJECT[i]) {
				continue;
			}
			Model.filter(support.TYPES_EXCEPT_OBJECT[i], function (err) {
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
		Model.filter = filter;
		Model.connection = {
			run: function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			}
		};

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (!support.TYPES_EXCEPT_OBJECT[i] || typeof support.TYPES_EXCEPT_OBJECT[i] === 'function') {
				continue;
			}
			Model.filter({}, support.TYPES_EXCEPT_OBJECT[i], function (err) {
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
		Model.filter = filter;
		Model.connection = {
			run: function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(new Error());
					}
				});
			}
		};

		Model.filter({ where: '{' }, function (err) {
			test.equal(err.type, 'UnhandledError');
			test.done();
		});
//	},
//	unhandledError2: function (test) {
//		test.expect(1);
//
//		filter('5', 'id', function (err) {
//			test.equal(err.type, 'UnhandledError');
//			test.done();
//		});
	}
};
