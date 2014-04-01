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
			User, Post, Profile, Comment;

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
					max: 2
				});

				var testModels = {
					User: reheat.defineModel('User', {
						tableName: 'user',
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
					}),
					Profile: reheat.defineModel('Profile', {
						tableName: 'profile',
						connection: connection,
						relations: {
							belongsTo: {
								User: {
									localKey: 'userId',
									localField: 'user'
								}
							}
						}
					}),
					Post: reheat.defineModel('Post', {
						tableName: 'post',
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
					}),
					Comment: reheat.defineModel('Comment', {
						tableName: 'comment',
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
					})
				};

				User = testModels.User;
				Profile = testModels.Profile;
				Post = testModels.Post;
				Comment = testModels.Comment;

				config.register('testModels', testModels);

				return Promise.all([
					User.tableReady,
					Profile.tableReady,
					Post.tableReady,
					Comment.tableReady,
					Profile.relations.indices.userId,
					Post.relations.indices.userId,
					Comment.relations.indices.userId,
					Comment.relations.indices.postId
				]);
			})
			.then(function () {

				var testData = {
					user1: new User({
						name: 'John Anderson'
					}),
					user2: new User({
						name: 'Sally Jones'
					}),
					profile1: new Profile({
						email: 'john.anderson@example.com'
					}),
					profile2: new Profile({
						email: 'sally.jones@example.com'
					}),
					post1: new Post({
						title: 'post1'
					}),
					post2: new Post({
						title: 'post2'
					}),
					post3: new Post({
						title: 'post5'
					}),
					post4: new Post({
						title: 'post3'
					}),
					post5: new Post({
						title: 'post4'
					}),
					comment1: new Comment({
						content: 'sweet!'
					}),
					comment2: new Comment({
						content: 'rad!'
					}),
					comment3: new Comment({
						content: 'awesome!'
					}),
					comment4: new Comment({
						content: 'outstanding!'
					}),
					comment5: new Comment({
						content: 'cool!'
					}),
					comment6: new Comment({
						content: 'wow!'
					}),
					comment7: new Comment({
						content: 'amazing!'
					}),
					comment8: new Comment({
						content: 'nice!'
					})
				};

				config.register('testData', testData);

				return testData.user1.save()
					.then(function (user1) {
						testData.profile1.setSync('userId', user1.get(User.idAttribute));
						testData.post1.setSync('userId', user1.get(User.idAttribute));
						testData.post2.setSync('userId', user1.get(User.idAttribute));
						testData.post5.setSync('userId', user1.get(User.idAttribute));
						testData.comment1.setSync('userId', user1.get(User.idAttribute));
						testData.comment2.setSync('userId', user1.get(User.idAttribute));
						testData.comment3.setSync('userId', user1.get(User.idAttribute));
						testData.comment4.setSync('userId', user1.get(User.idAttribute));
						testData.comment5.setSync('userId', user1.get(User.idAttribute));
						return Promise.all([
							testData.profile1.save(),
							testData.post1.save(),
							testData.post2.save()
								.then(function (post2) {
									testData.comment1.setSync('postId', post2.get(Post.idAttribute));
									return Promise.all([
										testData.comment1.save()
									]);
								}),
							testData.post5.save()
								.then(function (post5) {
									testData.comment2.setSync('postId', post5.get(Post.idAttribute));
									testData.comment3.setSync('postId', post5.get(Post.idAttribute));
									testData.comment4.setSync('postId', post5.get(Post.idAttribute));
									testData.comment5.setSync('postId', post5.get(Post.idAttribute));
									return Promise.all([
										testData.comment2.save(),
										testData.comment3.save(),
										testData.comment4.save(),
										testData.comment5.save()
									]);
								})
						]);
					})
					.then(function () {
						return testData.user2.save();
					})
					.then(function (user2) {
						testData.profile2.setSync('userId', user2.get(User.idAttribute));
						testData.post3.setSync('userId', user2.get(User.idAttribute));
						testData.post4.setSync('userId', user2.get(User.idAttribute));
						testData.comment6.setSync('userId', user2.get(User.idAttribute));
						testData.comment7.setSync('userId', user2.get(User.idAttribute));
						testData.comment8.setSync('userId', user2.get(User.idAttribute));
						return Promise.all([
							testData.profile2.save(),
							testData.post3.save()
								.then(function (post) {
									testData.comment6.setSync('postId', post.get(Post.idAttribute));
									testData.comment7.setSync('postId', post.get(Post.idAttribute));
									testData.comment8.setSync('postId', post.get(Post.idAttribute));
									return Promise.all([
										testData.comment6.save(),
										testData.comment7.save(),
										testData.comment8.save()
									]);
								}),
							testData.post4.save()
						]);
					});
			})
			.then(function () {
				done();
			})
			.catch(done)
			.error(done);
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
})
;
