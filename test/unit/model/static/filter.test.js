/*jshint loopfunc:true*/

var filter = require('../../../../build/instrument/lib/model/static/filter'),
	errors = require('../../../../build/instrument/lib/support/errors'),
	support = require('../../../support/support'),
	Promise = require('bluebird');

exports.filter = {
	normal: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' }
						]);
					}
				});
			})
		};

		Model.filter({}, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			Model.filter({}).then(function (instances) {
				test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
				test.done();
			});
		});
	},
	profile: function (test) {
		test.expect(5);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
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
			})
		};

		Model.filter({ where: '{}' }, { profile: true }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			Model.filter({ where: '{}' }, { profile: true }).then(function (instances) {
				test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
				test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
				test.done();
			});
		});
	},
	where: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' },
							{ id: 6, name: 'Sally' }
						]);
					}
				});
			})
		};

		Model.filter({ where: { name: 'John' }}, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			Model.filter({ where: { name: 'John' }}).then(function (instances) {
				test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
				test.done();
			});
		});
	},
	whereError: function (test) {
		test.expect(10);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_STRING_OR_OBJECT.length; i++) {
			if (typeof support.TYPES_EXCEPT_STRING_OR_OBJECT[i] === 'string' || !support.TYPES_EXCEPT_STRING_OR_OBJECT[i]) {
				continue;
			}
			queue.push((function (j) {
				return Model.filter({ where: support.TYPES_EXCEPT_STRING_OR_OBJECT[j] }).then(function () {
					support.fail('Should have failed on ' + support.TYPES_EXCEPT_STRING_OR_OBJECT[j]);
				})
					.catch(errors.IllegalArgumentError, function (err) {
						test.equal(err.type, 'IllegalArgumentError');
						test.deepEqual(err.errors, { where: { actual: typeof support.TYPES_EXCEPT_STRING_OR_OBJECT[j], expected: 'string|object' }});
					})
					.error(function () {
						support.fail('Should not have an unknown error!');
					});
			})(i));
		}

		Promise.all(queue).finally(function () {
			test.done();
		});
	},
	orderBy: function (test) {
		test.expect(5);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' },
							{ id: 6, name: 'Sally' }
						]);
					}
				});
			})
		};

		Model.filter({ orderBy: 'name'}, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			Model.filter({ orderBy: 'name'}).then(function (instances) {
				test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
				test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
				test.done();
			});
		});
	},
	orderByArray: function (test) {
		test.expect(5);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' },
							{ id: 6, name: 'Sally' }
						]);
					}
				});
			})
		};

		Model.filter({ orderBy: ['name', ['id', 'desc']]}, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			Model.filter({ orderBy: ['name', ['id', 'desc']]}).then(function (instances) {
				test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
				test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
				test.done();
			});
		});
	},
	limit: function (test) {
		test.expect(5);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' },
							{ id: 6, name: 'Sally' }
						]);
					}
				});
			})
		};

		Model.filter({ limit: 2 }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			Model.filter({ limit: 2 }).then(function (instances) {
				test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
				test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
				test.done();
			});
		});
	},
	limitError: function (test) {
		test.expect(8);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_NUMBER.length; i++) {
			if (typeof support.TYPES_EXCEPT_NUMBER[i] === 'string' || !support.TYPES_EXCEPT_NUMBER[i]) {
				continue;
			}
			queue.push((function (j) {
				return Model.filter({ limit: support.TYPES_EXCEPT_NUMBER[j] }).then(function () {
					support.fail('Should have failed on ' + support.TYPES_EXCEPT_NUMBER[j]);
				})
					.catch(errors.IllegalArgumentError, function (err) {
						test.equal(err.type, 'IllegalArgumentError');
						test.deepEqual(err.errors, { limit: { actual: typeof support.TYPES_EXCEPT_NUMBER[j], expected: 'number' }});
					})
					.error(function () {
						support.fail('Should not have an unknown error!');
					});
			})(i));
		}

		Promise.all(queue).finally(function () {
			test.done();
		});
	},
	skip: function (test) {
		test.expect(5);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' },
							{ id: 6, name: 'Sally' }
						]);
					}
				});
			})
		};

		Model.filter({ skip: 2 }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			Model.filter({ skip: 2 }).then(function (instances) {
				test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
				test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
				test.done();
			});
		});
	},
	skipError: function (test) {
		test.expect(8);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_NUMBER.length; i++) {
			if (typeof support.TYPES_EXCEPT_NUMBER[i] === 'string' || !support.TYPES_EXCEPT_NUMBER[i]) {
				continue;
			}
			queue.push((function (j) {
				return Model.filter({ skip: support.TYPES_EXCEPT_NUMBER[j] }).then(function () {
					support.fail('Should have failed on ' + support.TYPES_EXCEPT_NUMBER[j]);
				})
					.catch(errors.IllegalArgumentError, function (err) {
						test.equal(err.type, 'IllegalArgumentError');
						test.deepEqual(err.errors, { skip: { actual: typeof support.TYPES_EXCEPT_NUMBER[j], expected: 'number' }});
					})
					.error(function () {
						support.fail('Should not have an unknown error!');
					});
			})(i));
		}

		Promise.all(queue).finally(function () {
			test.done();
		});
	},
	pluck: function (test) {
		test.expect(5);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ name: 'John' },
							{ name: 'Sally' }
						]);
					}
				});
			})
		};

		Model.filter({ pluck: 'name' }, { raw: true }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0], { name: 'John' });
			test.deepEqual(instances[1], { name: 'Sally' });
			Model.filter({ pluck: 'name' }, { raw: true }).then(function (instances) {
				test.deepEqual(instances[0], { name: 'John' });
				test.deepEqual(instances[1], { name: 'Sally' });
				test.done();
			});
		});
	},
	pluckMultiple: function (test) {
		test.expect(5);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' },
							{ id: 6, name: 'Sally' }
						]);
					}
				});
			})
		};

		Model.filter({ pluck: ['name', 'id'] }, { raw: true }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0], { id: 5, name: 'John' });
			test.deepEqual(instances[1], { id: 6, name: 'Sally' });
			Model.filter({ pluck: ['name', 'id'] }, { raw: true }).then(function (instances) {
				test.deepEqual(instances[0], { id: 5, name: 'John' });
				test.deepEqual(instances[1], { id: 6, name: 'Sally' });
				test.done();
			});
		});
	},
	pluckError: function (test) {
		test.expect(10);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_STRING_OR_ARRAY.length; i++) {
			if (!support.TYPES_EXCEPT_STRING_OR_ARRAY[i]) {
				continue;
			}
			queue.push((function (j) {
				return Model.filter({ pluck: support.TYPES_EXCEPT_STRING_OR_ARRAY[j] }, { raw: true }).then(function () {
					support.fail('Should have failed on ' + support.TYPES_EXCEPT_STRING_OR_ARRAY[j]);
				})
					.catch(errors.IllegalArgumentError, function (err) {
						test.equal(err.type, 'IllegalArgumentError');
						test.deepEqual(err.errors, { pluck: { actual: typeof support.TYPES_EXCEPT_STRING_OR_ARRAY[j], expected: 'string|array' }});
					})
					.error(function () {
						support.fail('Should not have an unknown error!');
					});
			})(i));
		}

		Promise.all(queue).finally(function () {
			test.done();
		});
	},
	raw: function (test) {
		test.expect(5);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, {
					toArray: function (cb) {
						cb(null, [
							{ id: 5, name: 'John' },
							{ id: 6, name: 'Sally' }
						]);
					}
				});
			})
		};

		Model.filter({}, { raw: true }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0], { id: 5, name: 'John' });
			test.deepEqual(instances[1], { id: 6, name: 'Sally' });
			Model.filter({}, { raw: true }).then(function (instances) {
				test.deepEqual(instances[0], { id: 5, name: 'John' });
				test.deepEqual(instances[1], { id: 6, name: 'Sally' });
				test.done();
			});
		});
	},
	predicate: function (test) {
		test.expect(10);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (!support.TYPES_EXCEPT_OBJECT[i]) {
				continue;
			}
			queue.push((function (j) {
				return Model.filter(support.TYPES_EXCEPT_OBJECT[j]).then(function () {
					support.fail('Should have failed on ' + support.TYPES_EXCEPT_OBJECT[j]);
				})
					.catch(errors.IllegalArgumentError, function (err) {
						test.equal(err.type, 'IllegalArgumentError');
						test.deepEqual(err.errors, { actual: typeof support.TYPES_EXCEPT_OBJECT[j], expected: 'object' });
					})
					.error(function () {
						support.fail('Should not have an unknown error!');
					});
			})(i));
		}

		Promise.all(queue).finally(function () {
			test.done();
		});
	},
	options: function (test) {
		test.expect(8);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.filter = filter;

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (!support.TYPES_EXCEPT_OBJECT[i] || typeof support.TYPES_EXCEPT_OBJECT[i] === 'function') {
				continue;
			}
			queue.push((function (j) {
				return Model.filter({}, support.TYPES_EXCEPT_OBJECT[j]).then(function () {
					support.fail('Should have failed on ' + support.TYPES_EXCEPT_OBJECT[j]);
				})
					.catch(errors.IllegalArgumentError, function (err) {
						test.equal(err.type, 'IllegalArgumentError');
						test.deepEqual(err.errors, { actual: typeof support.TYPES_EXCEPT_OBJECT[j], expected: 'object' });
					})
					.error(function () {
						support.fail('Should not have an unknown error!');
					});
			})(i));
		}

		Promise.all(queue).finally(function () {
			test.done();
		});
	}
};
