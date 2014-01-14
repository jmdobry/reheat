/*jshint loopfunc:true*/

var getAll = require('../../../../../build/instrument/lib/model/static/getAll'),
	errors = require('../../../../../build/instrument/lib/support/errors'),
	support = require('../../../../support/support'),
	Promise = require('bluebird');

exports.getAll = {
	normal: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;
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

		Model.getAll('5', 'id', function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			Model.getAll('5', 'id').then(function (instances) {
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
		Model.getAll = getAll;
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

		Model.getAll(['5', '6'], 'id', { profile: true }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			Model.getAll(['5', '6'], 'id', { profile: true }).then(function (instances) {
				test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
				test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
				test.done();
			});
		});
	},
	normalKeyArray: function (test) {
		test.expect(5);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;
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

		Model.getAll(['5', '6'], 'id', function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
			test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
			Model.getAll(['5', '6'], 'id').then(function (instances) {
				test.deepEqual(instances[0].attributes, { id: 5, name: 'John' });
				test.deepEqual(instances[1].attributes, { id: 6, name: 'Sally' });
				test.done();
			});
		});
	},
	raw: function (test) {
		test.expect(5);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;
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

		Model.getAll(['5', '6'], { index: 'id' }, { raw: true }, function (err, instances) {
			test.ifError(err);
			test.deepEqual(instances[0], { id: 5, name: 'John' });
			test.deepEqual(instances[1], { id: 6, name: 'Sally' });
			Model.getAll(['5', '6'], { index: 'id' }, { raw: true }).then(function (instances) {
				test.deepEqual(instances[0], { id: 5, name: 'John' });
				test.deepEqual(instances[1], { id: 6, name: 'Sally' });
				test.done();
			});
		});
	},
	keys: function (test) {
		test.expect(16);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_STRING_OR_ARRAY.length; i++) {
			queue.push((function (j) {
				return Model.getAll(support.TYPES_EXCEPT_STRING_OR_ARRAY[j], { index: 'id' }).then(function () {
					support.fail('Should have failed on ' + support.TYPES_EXCEPT_STRING_OR_ARRAY[j]);
				})
					.catch(errors.IllegalArgumentError, function (err) {
						test.equal(err.type, 'IllegalArgumentError');
						test.deepEqual(err.errors, { actual: typeof support.TYPES_EXCEPT_STRING_OR_ARRAY[j], expected: 'string|array' });
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
	index: function (test) {
		test.expect(16);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableName = 'test';
		Model.getAll = getAll;

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_STRING_OR_OBJECT.length; i++) {
			queue.push((function (j) {
				return Model.getAll('5', support.TYPES_EXCEPT_STRING_OR_OBJECT[j]).then(function () {
					support.fail('Should have failed on ' + support.TYPES_EXCEPT_STRING_OR_OBJECT[j]);
				})
					.catch(errors.IllegalArgumentError, function (err) {
						test.equal(err.type, 'IllegalArgumentError');
						test.deepEqual(err.errors, { actual: typeof support.TYPES_EXCEPT_STRING_OR_OBJECT[j], expected: 'string|object' });
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
		Model.getAll = getAll;

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (support.TYPES_EXCEPT_OBJECT[i] && typeof support.TYPES_EXCEPT_OBJECT[i] !== 'function') {
				queue.push((function (type) {
					return Model.getAll('5', 'id', type).then(function () {
						support.fail('Should have failed on ' + type);
					})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { actual: typeof type, expected: 'object' });
						})
						.error(function () {
							support.fail('Should not have an unknown error!');
						});
				})(support.TYPES_EXCEPT_OBJECT[i]));
			}
		}

		Promise.all(queue).finally(function () {
			test.done();
		});
	}
};
