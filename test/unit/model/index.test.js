var reheat = require('../../../lib/'),
	destroy = require('../../../build/instrument/lib/model/prototype/destroy');

module.exports = function (assert, mout, support, errors, Promise) {

	return function () {
		describe('/model', function () {
			describe('/prototype', function () {
				describe('toJSON', function () {
					it('no tests yet!');
				});
				describe('clear', function () {
					it('no tests yet!');
				});
				describe('set', function () {
					it('no tests yet!');
				});
				describe('setSync', function () {
					it('no tests yet!');
				});
				describe('unset', function () {
					it('no tests yet!');
				});
				describe('save', function () {
					it('no tests yet!');
				});
				describe('destroy', function () {
					var instance, queue;
					before(function (done) {
						instance = {
							attributes: {
								name: 'John',
								id: 2
							},
							destroy: destroy,
							constructor: {
								connection: {},
								timestamps: true,
								softDelete: true,
								tableReady: Promise.resolve(),
								relations: {}
							},
							isNew: function () {
								return false;
							},
							get: function () {
								return 2;
							}
						};
						done();
					});
					beforeEach(function (done) {
						queue = []
						done();
					});

					it('shold throw an error for a non-function callback', function () {
						mout.array.forEach(support.TYPES_EXCEPT_FUNCTION, function (type) {
							if (type) {
								try {
									instance.destroy(false, type);
									support.fail('destroy let non-function type through');
								}
								catch (err) {
									assert.equal(err.type, 'IllegalArgumentError');
									assert.deepEqual(err.errors, { actual: typeof type, expected: 'function' });
									assert.equal(err.message, 'Model#destroy([options], cb): cb: Must be a function!');
								}
							}
						});
					});
					it('should throw an error for a non-object option', function () {
						mout.array.forEach(support.TYPES_EXCEPT_OBJECT, function (type) {
							if (type && typeof type != 'function') {
								instance.destroy(type, function (err) {
									assert.ok(err);
									assert.equal(err.type, 'IllegalArgumentError');
									assert.deepEqual(err.errors, { actual: typeof type, expected: 'object' });
									assert.equal(err.message, 'Model#destroy([options], cb): options: Must be an object!');
								});
							}
						});
					});
					it('should throw an error for an invalid relation', function () {
						var relationTypes = [{
							hasOne: {
								Snap: {}
							}
						}, {
							hasMany: {
								Crackle: {}
							}
						}, {
							belongsTo: {
								Pop: {}
							}
						}];
						var relationNames = ['hasOne', 'hasMany', 'belongsTo'];
						var objNames = ['Snap', 'Crackle', 'Pop'];
						var dummyObj = {};
						var queue = [];

						for (var i = 0; i < relationTypes.length; i++) {
							queue.push((function (j) {
								var newInstance = {
									destroy: destroy,
									constructor: {
										connection: {},
										timestamps: true,
										softDelete: true,
										tableReady: Promise.resolve(),
										relations: relationTypes[j]
									}
								};

								newInstance.destroy(dummyObj, function (err) {
									assert.equal(err.type, 'RuntimeError');
									assert.equal(err.message, 'undefined Model defined ' + relationNames[j] + ' relationship to nonexistent ' + objNames[j] + ' Model!');
								});
							})(i));
						}
						Promise.all(queue);
					});
				});
				describe('escape', function () {
					it('no tests yet!');
				});
				describe('functions', function () {
					it('no tests yet!');
				});
				describe('get', function () {
					it('no tests yet!');
				});
				describe('isNew', function () {
					it('no tests yet!');
				});
				describe('clone', function () {
					it('no tests yet!');
				});
				describe('validate', function () {
					it('no tests yet!');
				});
			});
			describe('/static', function () {
				describe('get', function () {
					it('no tests yet!');
				});
			});
			describe('defineModel', function () {
				var connection;
				before(function (done) {
					connection = new reheat.Connection({
						max: 1
					});
					reheat.defineModel('Dummy', {
						connection: connection
					});
					done();
				});
				after(function (done) {
					reheat.unregisterModel('Dummy');
					connection.drain();
					done();
				});

				it('should throw an error for a non-string name', function () {
					mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
						assert.throws(
							function () {
								reheat.defineModel(type, {
									connection: connection
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error when defining a already existing model', function () {
					assert.throws(
						function () {
							reheat.defineModel('Dummy', {
								connection: connection
							});
						},
						errors.RuntimeError
					);
				});
				it('should throw an error if staticProp idAttribute is not a string', function () {
					mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									idAttribute: type
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if staticProp tableName is not a string', function () {
					mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									tableName: type
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if staticProp timestamps is not a boolean', function () {
					mout.array.forEach(support.TYPES_EXCEPT_BOOLEAN, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									timestamps: type
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if staticProp softDelete is not a boolean', function () {
					mout.array.forEach(support.TYPES_EXCEPT_BOOLEAN, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									softDelete: type
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if staticProp relations is not an object', function () {
					mout.array.forEach(support.TYPES_EXCEPT_OBJECT, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									relations: type
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if staticProp schema is not a boolean', function () {
					mout.array.forEach(support.TYPES_EXCEPT_BOOLEAN, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									schema: type
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if hasOne is not an object', function () {
					mout.array.forEach(support.TYPES_EXCEPT_OBJECT, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									connection: connection,
									relations: {
										hasOne: type
									}
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if hasMany is not an object', function () {
					mout.array.forEach(support.TYPES_EXCEPT_OBJECT, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									connection: connection,
									relations: {
										hasMany: type
									}
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if belongsTo is not an object', function () {
					mout.array.forEach(support.TYPES_EXCEPT_OBJECT, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									connection: connection,
									relations: {
										belongsTo: type
									}
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if localField for hasOne is not a string', function () {
					mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									connection: connection,
									relations: {
										hasOne: {
											Dummy: {
												localField: type
											}
										}
									}
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if foreignKey for hasOne is not a string', function () {
					mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									connection: connection,
									relations: {
										hasOne: {
											Dummy: {
												foreignKey: type
											}
										}
									}
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should populate localField and foreignKey for hasOne with default values per spec', function () {
					var Post;
					assert.doesNotThrow(
						function () {
							Post = reheat.defineModel('Post', {
								connection: connection,
								relations: {
									hasOne: {
										Dummy: {}
									}
								}
							});
						}
					);
					assert.equal(Post.relations.hasOne.Dummy.localField, 'dummy');
					assert.equal(Post.relations.hasOne.Dummy.foreignKey, 'dummyId');
					reheat.unregisterModel('Post');
				});
				it('should throw an error if localField for hasMany is not a string', function () {
					mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									connection: connection,
									relations: {
										hasMany: {
											Dummy: {
												localField: type
											}
										}
									}
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if foreignKey for hasMany is not a string', function () {
					mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									connection: connection,
									relations: {
										hasMany: {
											Dummy: {
												foreignKey: type
											}
										}
									}
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should populate localField and foreignKey for hasMany with default values per spec', function () {
					var Post;
					assert.doesNotThrow(
						function () {
							Post = reheat.defineModel('Post', {
								connection: connection,
								relations: {
									hasMany: {
										Dummy: {}
									}
								}
							});
						}
					);
					assert.equal(Post.relations.hasMany.Dummy.localField, 'dummyList');
					assert.equal(Post.relations.hasMany.Dummy.foreignKey, 'dummyId');
					reheat.unregisterModel('Post');
				});
				it('should throw an error if localField for belongsTo is not a string', function () {
					mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									connection: connection,
									relations: {
										belongsTo: {
											Dummy: {
												localField: type
											}
										}
									}
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should throw an error if localKey for belongsTo is not a string', function () {
					mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
						assert.throws(
							function () {
								reheat.defineModel('Post', {
									connection: connection,
									relations: {
										belongsTo: {
											Dummy: {
												localKey: type
											}
										}
									}
								});
							},
							errors.IllegalArgumentError
						);
					});
				});
				it('should populate localField and localKey for belongsTo with default values per spec', function () {
					var Post;
					assert.doesNotThrow(
						function () {
							Post = reheat.defineModel('Post', {
								connection: connection,
								relations: {
									belongsTo: {
										Dummy: {}
									}
								}
							});
						}
					);
					assert.equal(Post.relations.belongsTo.Dummy.localField, 'dummy');
					assert.equal(Post.relations.belongsTo.Dummy.localKey, 'dummyId');
					reheat.unregisterModel('Post');
				});
			});
		});
	};
};
