module.exports = function () {
	var config = require('./config'),
		container = config.container,
		r,
		reheat;

	beforeEach(function (done) {
		config.reset();
		r = container.get('r');
		reheat = require('../lib');

		var connection = new reheat.Connection(),
			tables = ['user', 'post', 'comment', 'profile'],
			User, Post, Profile, Comment,
			utils = container.get('utils');

		connection.run(r.dbList())
			.then(function (dbList) {
				if (utils.contains(dbList, 'test')) {
					return connection.run(r.dbDrop('test'));
				} else {
					return null;
				}
			})
			.then(function () {
				connection.drain(function () {
					connection.destroyAllNow();

					connection = new reheat.Connection();

					User = reheat.defineModel('User', {
						tableName: tables[0],
						connection: connection,
						relations: {
							hasMany: {
								Post: {
									localField: 'posts',
									foreignKey: 'userId'
								},
								Comment: {
									localField: 'comments',
									foreignKey: 'userId'
								}
							},
							hasOne: {
								Profile: {
									localField: 'profile',
									foreignKey: 'userId'
								}
							}
						}
					});

					Profile = reheat.defineModel('Profile', {
						tableName: tables[3],
						connection: connection,
						relations: {
							belongsTo: {
								User: {
									localKey: 'userId',
									localField: 'user'
								}
							}
						}
					});

					Post = reheat.defineModel('Post', {
						tableName: tables[1],
						connection: connection,
						relations: {
							belongsTo: {
								User: {
									localKey: 'userId',
									localField: 'user'
								}
							},
							hasMany: {
								Comment: {
									localField: 'comments',
									foreignKey: 'postId'
								}
							}
						}
					});

					Comment = reheat.defineModel('Comment', {
						tableName: tables[2],
						connection: connection,
						relations: {
							belongsTo: {
								User: {
									localKey: 'userId',
									localField: 'user'
								},
								Post: {
									localKey: 'postId',
									localField: 'post'
								}
							}
						}
					});
					done();
				});
			}).catch(done).error(done);
	});

	afterEach(function (done) {
		var connection = new reheat.Connection(),
			utils = container.get('utils');

		r = container.get('r');

		connection.run(r.dbList())
			.then(function (dbList) {
				if (utils.contains(dbList, 'test')) {
					return connection.run(r.dbDrop('test'));
				}
				return null;
			})
			.then(function () {
				reheat.unregisterModel('User');
				reheat.unregisterModel('Post');
				reheat.unregisterModel('Comment');
				reheat.unregisterModel('Profile');
				done();
			})
			.catch(done)
			.error(done);
	});
	describe('/collection', function () {
		describe('/static', function () {
//			describe('filter.js', require('./integration/collection/static/filter.test'));
			describe('getAll.js', function () {
				it('no tests yet!');
			});
		});
		describe('/prototype', function () {
			describe('index.js', function () {
				it('no tests yet!');
			});
		});
	});
};
