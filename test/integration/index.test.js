describe('/integration', function () {
	var config = require('./config'),
		Promise = config.get('Promise'),
		r = config.get('r'),
		reheat = require('../../lib'),
		utils = config.get('utils');

	beforeEach(function (done) {
		var connection = new reheat.Connection({
				max: 1
			}),
			tables = ['user', 'post', 'comment', 'profile'],
			User, Post, Profile, Comment, Users, Posts, Profiles, Comments;

		connection.run(r.db('test').tableList())
			.then(function (tableList) {
				var tasks = [];

				utils.forEach(tableList, function (table) {
					tasks.push(connection.run(r.db('test').table(table).delete()));
				});

				return Promise.all(tasks);
			})
			.then(function () {
				return connection.drain();
			})
			.then(function () {
				return connection.destroyAllNow();
			})
			.then(function () {
				connection = new reheat.Connection({
					max: 5
				});

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

				Users = reheat.defineCollection('Users', {
					model: User
				});

				Profiles = reheat.defineCollection('Profiles', {
					model: Profile
				});

				Posts = reheat.defineCollection('Posts', {
					model: Post
				});

				Comments = reheat.defineCollection('Comments', {
					model: Comment
				});

				config.register('User', function () {
					return User;
				});

				config.register('Users', function () {
					return Users;
				});

				config.register('Profile', function () {
					return Profile;
				});

				config.register('Profiles', function () {
					return Profiles;
				});

				config.register('Post', function () {
					return Post;
				});

				config.register('Posts', function () {
					return Posts;
				});

				config.register('Comment', function () {
					return Comment;
				});

				config.register('Comments', function () {
					return Comments;
				});

				return Promise.all([
						User.tableReady,
						Profile.tableReady,
						Post.tableReady,
						Comment.tableReady,
						Profile.relations.indices.userId,
						Post.relations.indices.userId,
						Comment.relations.indices.userId,
						Comment.relations.indices.postId
					]).then(function () {
						done();
					});
			}).catch(done).error(done);
	});

	afterEach(function (done) {
		Promise.resolve()
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

	config.register('integration_collection_tests', require('./collection/index.test'));
	config.register('integration_model_tests', require('./model/index.test'));

	describe('/collection', config.get('integration_collection_tests'));
	describe('/model', config.get('integration_model_tests'));
});
