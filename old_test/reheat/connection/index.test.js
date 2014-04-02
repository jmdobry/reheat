/*jshint loopfunc:true*/

var errors = require('../../../../build/instrument/lib/support/errors'),
	SandboxedModule = require('sandboxed-module'),
	Connection = SandboxedModule.require('../../../../build/instrument/lib/connection', {
		requires: {
			'../support/utils': require('../../../../build/instrument/lib/support/utils'), // Real dependency
			'../support/errors': errors, // Real dependency
			'generic-pool': require('generic-pool'), // Real dependency
			rethinkdb: {
				connect: function (options, cb) {
					setTimeout(function () {
						cb(null, {
							close: function () {
							}
						});
					}, 100);
				},
				dbList: function () {
					return {
						run: function (conn, cb) {
							cb(null, ['test']);
						}
					};
				}
			}
		}
	}),
	Promise = require('bluebird'),
	support = require('../../../support/support');

exports.Connection = {
	setUp: function (cb) {
		try {
			this.connection = new Connection();
		} catch (err) {
			console.error(err.stack);
		}
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

	configure: {
		optionsOnly: function (test) {
			var _this = this;
			test.expect(2);

			this.connection.configure({
				db: 'different'
			}, function (err) {
				test.ifError(err);
				test.equal(_this.connection.get('db'), 'different', 'Should have a different db');
				test.done();
			});
		},
		optionsAndCallback: function (test) {
			var _this = this;
			test.expect(2);

			this.connection.configure({
				db: 'different'
			}, function (err) {
				test.ifError(err);
				test.equal(_this.connection.get('db'), 'different', 'Should have a different db');

				test.done();
			});
		},
		optionsStrictAndCallback: function (test) {
			var _this = this;
			test.expect(2);

			this.connection.configure({
				db: 'different'
			}, true, function (err) {
				test.ifError(err);
				test.equal(_this.connection.get('db'), 'different', 'Should have a different db');

				test.done();
			});
		},
		strictReset: function (test) {
			var _this = this;
			test.expect(10);

			this.connection.configure({
				db: 'different',
				host: 'different',
				port: 1111,
				authKey: 'secret'
			}, function (err) {
				test.ifError(err);
				test.equal(_this.connection.get('db'), 'different', 'Should have a different db');
				test.equal(_this.connection.get('host'), 'different', 'Should have a different host');
				test.equal(_this.connection.get('port'), 1111, 'Should have a different port');
				test.equal(_this.connection.get('authKey'), 'secret', 'Should have a different authKey');

				_this.connection.configure(null, true, function (err) {
					test.ifError(err);
					test.equal(_this.connection.get('db'), 'test', 'Should have the default db');
					test.equal(_this.connection.get('host'), 'localhost', 'Should have the default host');
					test.equal(_this.connection.get('port'), 28015, 'Should have the default port');
					test.equal(_this.connection.get('authKey'), '', 'Should have the default authKey');
					test.done();
				});
			});
		},
		options: function (test) {
			var _this = this;
			test.expect(8);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
				if (support.TYPES_EXCEPT_OBJECT[i] && typeof support.TYPES_EXCEPT_OBJECT[i] !== 'function') {
					queue.push((function (j) {
						return _this.connection.configure(support.TYPES_EXCEPT_OBJECT[j]).then(function () {
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
			}

			Promise.all(queue).finally(function () {
				test.done();
			});
		},
		port: function (test) {
			var _this = this;
			test.expect(10);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_NUMBER.length; i++) {
				if (!support.TYPES_EXCEPT_NUMBER[i]) {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						port: support.TYPES_EXCEPT_NUMBER[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_NUMBER[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { port: { actual: typeof support.TYPES_EXCEPT_NUMBER[j], expected: 'number' } });
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
		db: function (test) {
			var _this = this;
			test.expect(12);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
				if (!support.TYPES_EXCEPT_STRING[i]) {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						db: support.TYPES_EXCEPT_STRING[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_STRING[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { db: { actual: typeof support.TYPES_EXCEPT_STRING[j], expected: 'string' } });
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
		host: function (test) {
			var _this = this;
			test.expect(12);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
				if (!support.TYPES_EXCEPT_STRING[i]) {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						host: support.TYPES_EXCEPT_STRING[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_STRING[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { host: { actual: typeof support.TYPES_EXCEPT_STRING[j], expected: 'string' } });
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
		authKey: function (test) {
			var _this = this;
			test.expect(12);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
				if (!support.TYPES_EXCEPT_STRING[i]) {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						authKey: support.TYPES_EXCEPT_STRING[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_STRING[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { authKey: { actual: typeof support.TYPES_EXCEPT_STRING[j], expected: 'string' } });
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
		name: function (test) {
			var _this = this;
			test.expect(12);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
				if (!support.TYPES_EXCEPT_STRING[i]) {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						name: support.TYPES_EXCEPT_STRING[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_STRING[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { name: { actual: typeof support.TYPES_EXCEPT_STRING[j], expected: 'string' } });
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
		max: function (test) {
			var _this = this;
			test.expect(10);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_NUMBER.length; i++) {
				if (!support.TYPES_EXCEPT_NUMBER[i]) {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						max: support.TYPES_EXCEPT_NUMBER[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_NUMBER[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { max: { actual: typeof support.TYPES_EXCEPT_NUMBER[j], expected: 'number' } });
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
		min: function (test) {
			var _this = this;
			test.expect(10);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_NUMBER.length; i++) {
				if (!support.TYPES_EXCEPT_NUMBER[i]) {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						min: support.TYPES_EXCEPT_NUMBER[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_NUMBER[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { min: { actual: typeof support.TYPES_EXCEPT_NUMBER[j], expected: 'number' } });
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
		idleTimeoutMillis: function (test) {
			var _this = this;
			test.expect(10);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_NUMBER.length; i++) {
				if (!support.TYPES_EXCEPT_NUMBER[i]) {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						idleTimeoutMillis: support.TYPES_EXCEPT_NUMBER[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_NUMBER[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { idleTimeoutMillis: { actual: typeof support.TYPES_EXCEPT_NUMBER[j], expected: 'number' } });
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
		reapIntervalMillis: function (test) {
			var _this = this;
			test.expect(10);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_NUMBER.length; i++) {
				if (!support.TYPES_EXCEPT_NUMBER[i]) {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						reapIntervalMillis: support.TYPES_EXCEPT_NUMBER[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_NUMBER[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { reapIntervalMillis: { actual: typeof support.TYPES_EXCEPT_NUMBER[j], expected: 'number' } });
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
		priorityRange: function (test) {
			var _this = this;
			test.expect(10);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_NUMBER.length; i++) {
				if (!support.TYPES_EXCEPT_NUMBER[i]) {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						priorityRange: support.TYPES_EXCEPT_NUMBER[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_NUMBER[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { priorityRange: { actual: typeof support.TYPES_EXCEPT_NUMBER[j], expected: 'number' } });
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
		refreshIdle: function (test) {
			var _this = this;
			test.expect(12);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_BOOLEAN.length; i++) {
				if (!support.TYPES_EXCEPT_BOOLEAN[i]) {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						refreshIdle: support.TYPES_EXCEPT_BOOLEAN[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_BOOLEAN[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { refreshIdle: { actual: typeof support.TYPES_EXCEPT_BOOLEAN[j], expected: 'boolean' } });
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
		log: function (test) {
			var _this = this;
			test.expect(10);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_BOOLEAN.length; i++) {
				if (!support.TYPES_EXCEPT_BOOLEAN[i] || typeof support.TYPES_EXCEPT_BOOLEAN[i] === 'function') {
					continue;
				}
				queue.push((function (j) {
					return _this.connection.configure({
						log: support.TYPES_EXCEPT_BOOLEAN[j]
					}).then(function () {
							support.fail('Should have failed on ' + support.TYPES_EXCEPT_BOOLEAN[j]);
						})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { log: { actual: typeof support.TYPES_EXCEPT_BOOLEAN[j], expected: 'boolean|function' } });
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
		callbackError: function (test) {
			var _this = this;
			test.expect(1);

			_this.connection.configure({
				log: 345
			}, true, function (err) {
				test.equal(err.type, 'IllegalArgumentError');
				test.done();
			});
		}
	},

	destroy: function (test) {
		var _this = this;

		test.expect(11);

		this.connection.acquire(function (err, conn) {
			test.ifError(err);
			test.ok('close' in conn);
			test.equal(typeof conn.close, 'function');
			_this.connection.destroy(conn);
			test.equal(_this.connection.availableObjectsCount(), 0);
			test.equal(_this.connection.waitingClientsCount(), 0);
			test.equal(_this.connection.getPoolSize(), 0);

			_this.connection.acquire().then(function (conn) {
				test.ok('close' in conn);
				test.equal(typeof conn.close, 'function');
				_this.connection.destroy(conn);
				test.equal(_this.connection.availableObjectsCount(), 0);
				test.equal(_this.connection.waitingClientsCount(), 0);
				test.equal(_this.connection.getPoolSize(), 0);

				test.done();
			});
		});
	},

	acquire: function (test) {
		var _this = this;

		test.expect(11);

		this.connection.acquire(function (err, conn) {
			test.ifError(err);
			test.ok('close' in conn);
			test.equal(typeof conn.close, 'function');
			_this.connection.release(conn);
			test.equal(_this.connection.availableObjectsCount(), 1);
			test.equal(_this.connection.waitingClientsCount(), 0);
			test.equal(_this.connection.getPoolSize(), 1);

			_this.connection.acquire().then(function (conn) {
				test.ok('close' in conn);
				test.equal(typeof conn.close, 'function');
				_this.connection.release(conn);
				test.equal(_this.connection.availableObjectsCount(), 1);
				test.equal(_this.connection.waitingClientsCount(), 0);
				test.equal(_this.connection.getPoolSize(), 1);

				test.done();
			});
		});
	},

	release: function (test) {
		var _this = this;

		test.expect(7);

		this.connection.acquire(function (err, conn) {
			test.ifError(err);
			_this.connection.release(conn);
			test.equal(_this.connection.availableObjectsCount(), 1);
			test.equal(_this.connection.waitingClientsCount(), 0);
			test.equal(_this.connection.getPoolSize(), 1);

			_this.connection.acquire().then(function (conn) {
				_this.connection.release(conn);
				test.equal(_this.connection.availableObjectsCount(), 1);
				test.equal(_this.connection.waitingClientsCount(), 0);
				test.equal(_this.connection.getPoolSize(), 1);

				test.done();
			});
		});
	},

	drain: function (test) {
		var _this = this;

		test.expect(4);

		this.connection.acquire(function (err, conn) {
			test.ifError(err);
			_this.connection.release(conn);
			_this.connection.drain(function () {
				_this.connection.destroyAllNow(function () {
					test.equal(_this.connection.availableObjectsCount(), 0);
					test.equal(_this.connection.waitingClientsCount(), 0);
					test.equal(_this.connection.getPoolSize(), 0);
					test.done();
				});
			});
		});
	},

	destroyAllNow: function (test) {
		var _this = this;

		test.expect(4);

		this.connection.acquire(function (err, conn) {
			test.ifError(err);
			_this.connection.release(conn);
			_this.connection.destroyAllNow();
			test.equal(_this.connection.availableObjectsCount(), 0);
			test.equal(_this.connection.waitingClientsCount(), 0);
			test.equal(_this.connection.getPoolSize(), 0);

			test.done();
		});
	},

	pooled: {
		test1: function (test) {
			test.expect(5);

			var privateFn, publicFn;
			publicFn = this.connection.pooled(privateFn = function (client, arg, cb) {
				test.ok('close' in client);
				test.equal(typeof client.close, 'function');
				test.equal(arg, 'hello');
				cb(null, arg);
			});

			publicFn('hello', function (err, result) {
				test.ifError(err);
				test.equal(result, 'hello');
				test.done();
			});
		},
		test2: function (test) {
			test.expect(10);

			var privateTop, privateBottom, publicTop, publicBottom;
			publicBottom = this.connection.pooled(privateBottom = function (client, arg, cb) {
				test.ok('close' in client);
				test.equal(typeof client.close, 'function');
				test.equal(arg, 'hello');
				cb(null, arg);
			});

			publicTop = this.connection.pooled(privateTop = function (client, arg, cb) {
				test.ok('close' in client);
				test.equal(typeof client.close, 'function');
				test.equal(arg, 'hello');
				privateBottom(client, arg, function (err, retVal) {
					test.ifError(err);
					test.equal(retVal, 'hello');
					cb(null, retVal);
				});
			});

			publicTop('hello', function (err, retVal) {
				test.ifError(err);
				test.equal(retVal, 'hello');
				test.done();
			});
		}
	},

	getPoolSize: function (test) {
		var _this = this;

		test.expect(7);

		test.equal(this.connection.getPoolSize(), 0, 'Should start with an empty pool');

		this.connection.configure({
			max: 2
		}, function (err) {
			test.ifError(err);

			test.equal(_this.connection.getPoolSize(), 0, 'Should still have an empty pool');

			_this.connection.acquire(function (err, conn) {
				test.ifError(err);

				test.equal(_this.connection.getPoolSize(), 1, 'There should now be one resource in the pool');
				_this.connection.release(conn);
				test.equal(_this.connection.getPoolSize(), 1, 'There should still be one resource in the pool');

				Promise.all([
						_this.connection.acquire().then(function (conn) {
							var deferred = Promise.defer();
							setTimeout(function () {
								_this.connection.release(conn);
								deferred.resolve();
							}, 100);
							return deferred.promise;
						}),
						_this.connection.acquire().then(function (conn) {
							var deferred = Promise.defer();
							setTimeout(function () {
								_this.connection.release(conn);
								deferred.resolve();
							}, 100);
							return deferred.promise;
						})
					]).then(function () {
						test.equal(_this.connection.getPoolSize(), 2, 'There should now be two resources in the pool');
						test.done();
					});
			});
		});
	},

	getName: function (test) {
		var _this = this;
		test.expect(3);

		test.equal(this.connection.getName(), '', 'Should have the default name');

		this.connection.configure({
			name: 'newName'
		}, function (err) {
			test.ifError(err);

			test.equal(_this.connection.getName(), 'newName', 'Should have a different name');

			test.done();
		});
	},

	availableObjectsCount: function (test) {
		var _this = this;

		test.expect(4);

		test.equal(this.connection.availableObjectsCount(), 0, 'Should not have anything available to start with');

		this.connection.acquire(function (err, conn) {
			test.ifError(err);

			test.equal(_this.connection.availableObjectsCount(), 0, 'Still should not have anything available to start with');
			_this.connection.release(conn);
			test.equal(_this.connection.availableObjectsCount(), 1, 'There should now be one available object');

			test.done();
		});
	},

	waitingClientsCount: function (test) {
		var _this = this;

		test.expect(4);

		test.equal(this.connection.waitingClientsCount(), 0, 'Should not have any clients waiting to start with');

		this.connection.acquire(function (err) {
			test.ifError(err);

			test.equal(_this.connection.waitingClientsCount(), 0, 'Should no longer have any waiting clients');

			test.done();
		});

		test.equal(this.connection.waitingClientsCount(), 1, 'Should now have one waiting client');
	},

	run: {
		test1: function (test) {
			var _this = this;
			test.expect(8);

			var queue = [];

			for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
				if (support.TYPES_EXCEPT_OBJECT[i] && typeof support.TYPES_EXCEPT_OBJECT[i] !== 'function') {
					queue.push((function (j) {
						return _this.connection.run({
							run: function (options, next) {
								next();
							}
						}, support.TYPES_EXCEPT_OBJECT[j]).then(function () {
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
			}

			Promise.all(queue).finally(function () {
				test.done();
			});
		},
		noQuery: function (test) {
			var _this = this;
			test.expect(1);

			_this.connection.run(null, {}, function (err) {
				test.equal(err.type, 'IllegalArgumentError');
				test.done();
			});
		}
	}
};
