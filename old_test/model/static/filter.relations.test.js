/*jshint loopfunc:true*/

var Connection = require('../../../../build/instrument/lib/connection'),
	reheat = require('../../../../build/instrument/lib'),
	utils = require('../../../../build/instrument/lib/support/utils'),
	r = require('rethinkdb'),
	connection,
	Promise = require('bluebird'),
	tables = ['user', 'post', 'comment', 'profile'],
	User, Post, Comment, Profile;

exports.saveIntegration = {
	setUp: function (cb) {
		connection = new Connection();
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

					connection = new Connection();

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
					cb();
				});
			}).catch(cb).error(cb);
	},

	tearDown: function (cb) {
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
				cb();
			})
			.catch(cb)
			.error(cb);
	},
	relations: function (test) {
		var user = new User({
				name: 'John Anderson'
			}),
			user2 = new User({
				name: 'Sally Jones'
			}),
			profile = new Profile({
				email: 'john.anderson@example.com'
			}),
			profile2 = new Profile({
				email: 'sally.jones@example.com'
			}),
			post1 = new Post({
				title: 'post1'
			}),
			post2 = new Post({
				title: 'post2'
			}),
			post5 = new Post({
				title: 'post5'
			}),
			post3 = new Post({
				title: 'post3'
			}),
			post4 = new Post({
				title: 'post4'
			}),
			comment1 = new Comment({
				content: 'sweet!'
			}),
			comment2 = new Comment({
				content: 'rad!'
			}),
			comment3 = new Comment({
				content: 'awesome!'
			}),
			comment4 = new Comment({
				content: 'outstanding!'
			}),
			comment5 = new Comment({
				content: 'cool!'
			}),
			comment6 = new Comment({
				content: 'wow!'
			}),
			comment7 = new Comment({
				content: 'amazing!'
			}),
			comment8 = new Comment({
				content: 'nice!'
			});

		user.save()
			.then(function (user) {
				profile.setSync('userId', user.get(User.idAttribute));
				post1.setSync('userId', user.get(User.idAttribute));
				post2.setSync('userId', user.get(User.idAttribute));
				post5.setSync('userId', user.get(User.idAttribute));
				comment1.setSync('userId', user.get(User.idAttribute));
				comment2.setSync('userId', user.get(User.idAttribute));
				comment3.setSync('userId', user.get(User.idAttribute));
				comment4.setSync('userId', user.get(User.idAttribute));
				comment5.setSync('userId', user.get(User.idAttribute));
				return Promise.all([
					profile.save(),
					post1.save(),
					post2.save()
						.then(function (post) {
							comment1.setSync('postId', post.get(Post.idAttribute));
							return Promise.all([
								comment1.save()
							]);
						}),
					post5.save()
						.then(function (post) {
							comment2.setSync('postId', post.get(Post.idAttribute));
							comment3.setSync('postId', post.get(Post.idAttribute));
							comment4.setSync('postId', post.get(Post.idAttribute));
							comment5.setSync('postId', post.get(Post.idAttribute));
							return Promise.all([
								comment2.save(),
								comment3.save(),
								comment4.save(),
								comment5.save()
							]);
						})
				]);
			})
			.then(function () {
				return user2.save();
			})
			.then(function (user2) {
				profile2.setSync('userId', user2.get(User.idAttribute));
				post3.setSync('userId', user2.get(User.idAttribute));
				post4.setSync('userId', user2.get(User.idAttribute));
				comment6.setSync('userId', user2.get(User.idAttribute));
				comment7.setSync('userId', user2.get(User.idAttribute));
				comment8.setSync('userId', user2.get(User.idAttribute));
				return Promise.all([
					profile2.save(),
					post3.save()
						.then(function (post) {
							comment6.setSync('postId', post.get(Post.idAttribute));
							comment7.setSync('postId', post.get(Post.idAttribute));
							comment8.setSync('postId', post.get(Post.idAttribute));
							return Promise.all([
								comment6.save(),
								comment7.save(),
								comment8.save()
							]);
						}),
					post4.save()
				]);
			})
			// Test the first user
			.then(function () {
				test.ok(user.get(User.idAttribute));
				test.ok(user2.get(User.idAttribute));
			})
			.then(function () {
				return User.filter({}, { with: ['Profile'] });
			})
			.then(function (tempUsers) {
				test.equal(tempUsers.length, 2);
				utils.forEach(tempUsers, function (tempUser) {
					test.ok(tempUser instanceof User);

					var tempProfile = tempUser.get(User.relations.hasOne.Profile.localField);
					test.ok(tempProfile instanceof Profile);
					test.equal(tempProfile.get(User.relations.hasOne.Profile.foreignKey), tempUser.get(User.idAttribute));
				});
				return User.filter({}, { with: ['Post'] });
			})
			.then(function (tempUsers) {
				test.equal(tempUsers.length, 2);
				utils.forEach(tempUsers, function (tempUser) {
					test.ok(tempUser instanceof User);

					var tempPosts = tempUser.get(User.relations.hasMany.Post.localField);

					utils.forEach(tempPosts, function (tempPost) {
						test.ok(tempPost instanceof Post);
						test.equal(tempPost.get(User.relations.hasMany.Post.foreignKey), tempUser.get(User.idAttribute));
					});
				});
				return Profile.filter({}, { with: ['User'] });
			})
			.then(function (tempProfiles) {
				test.equal(tempProfiles.length, 2);
				utils.forEach(tempProfiles, function (tempProfile) {
					test.ok(tempProfile instanceof Profile);

					var tempUser = tempProfile.get(Profile.relations.belongsTo.User.localField);

					test.ok(tempUser instanceof User);
					test.equal(tempUser.get(User.idAttribute), tempProfile.get(Profile.relations.belongsTo.User.localKey));
				});
				test.done();
			})
			.catch(test.done)
			.error(test.done);
	}
};
