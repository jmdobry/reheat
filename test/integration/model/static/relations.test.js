/*jshint loopfunc:true*/

var Connection = require('../../../../build/instrument/lib/connection'),
	reheat = require('../../../../build/instrument/lib'),
	support = require('../../../support/support.js'),
	r = require('rethinkdb'),
	sinon = require('sinon'),
	mout = require('mout'),
	connection = new Connection(),
	Model = require('../../../../lib/model'),
	Promise = require('bluebird'),
	tables = ['user', 'post', 'comment', 'profile'],
	User, Post, Comment, Profile;

exports.saveIntegration = {
	setUp: function (cb) {
		var tasks = [],
			tasks2 = [],
			tasks3 = [];
		for (var i = 0; i < tables.length; i++) {
			tasks.push(support.ensureTableExists(tables[i]));
		}
		tasks2.push(support.ensureIndexExists(tables[1], 'userId'));
		tasks2.push(support.ensureIndexExists(tables[2], 'userId'));
		tasks2.push(support.ensureIndexExists(tables[2], 'postId'));
		tasks2.push(support.ensureIndexExists(tables[3], 'userId'));
		for (i = 0; i < tables.length; i++) {
			tasks3.push(r.table(tables[i]).delete());
		}
		Promise.all(tasks)
			.then(function () {
				return Promise.all(tasks2);
			})
			.then(function () {
				return Promise.all(tasks3);
			})
			.then(function () {
				User = reheat.defineModel('User', {
					tableName: tables[0],
					connection: connection,
					relations: {
						hasMany: {
							Post: {
								localField: 'posts' || mout.string.camelCase('Post') + 'List',
								foreignKey: 'userId' || mout.string.camelCase('User') + 'Id'
							},
							Comment: {
								localField: 'comments' || mout.string.camelCase('Comment') + 'List',
								foreignKey: 'userId' || mout.string.camelCase('User') + 'Id'
							}
						},
						hasOne: {
							Profile: {
								localField: 'profile' || mout.string.camelCase('Profile'),
								foreignKey: 'userId' || mout.string.camelCase('Profile') + 'Id'
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
								localKey: 'userId' || mout.string.camelCase('User') + 'Id',
								localField: 'user' || mout.string.camelCase('User')
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
								localKey: 'userId' || mout.string.camelCase('User') + 'Id',
								localField: 'user' || mout.string.camelCase('User')
							}
						},
						hasMany: {
							Comment: {
								localField: 'comments' || mout.string.camelCase('Comment') + 'List',
								foreignKey: 'postId' || mout.string.camelCase('User') + 'Id'
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
								localKey: 'userId' || mout.string.camelCase('User') + 'Id',
								localField: 'user' || mout.string.camelCase('User')
							},
							Post: {
								localKey: 'postId' || mout.string.camelCase('Post') + 'Id',
								localField: 'post' || mout.string.camelCase('Post')
							}
						}
					}
				});
				cb();
			})
			.catch(cb)
			.error(cb);
	},

	tearDown: function (cb) {
		var tasks = [],
			tasks2 = [];
		for (var i = 0; i < tables.length; i++) {
			tasks.push(support.ensureTableExists(tables[i]));
		}
		for (i = 0; i < tables.length; i++) {
			tasks2.push(r.table(tables[i]).delete());
		}
		Promise.all(tasks)
			.then(function () {
				return Promise.all(tasks2);
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
//	cascadeSave: function (test) {
//
//		var user = new User({
//			name: 'John Anderson',
//			posts: [
//				{
//					title: 'post1'
//				},
//				{
//					title: 'post2',
//					comments: [
//						{
//							content: 'nice!'
//						}
//					]
//				},
//				{
//					title: 'post5',
//					comments: [
//						{
//							content: 'super!'
//						},
//						{
//							content: 'sweet!'
//						}
//					]
//				}
//			]
//		});
//
//		var user2 = new User({
//			name: 'Sally Jones',
//			posts: [
//				{
//					title: 'post3',
//					comments: [
//						{
//							content: 'outstanding!'
//						},
//						{
//							content: 'awesome!'
//						},
//						{
//							content: 'great!'
//						}
//					]
//				},
//				{
//					title: 'post4'
//				}
//			]
//		});
//
//		user.save()
//			.then(function (user) {
//				console.log(user);
//				test.ok(user instanceof User);
//				var posts = user.get('posts');
//				test.ok(mout.lang.isArray(posts));
//				test.equal(posts.length, 3);
//				for (var i = 0; i < posts.length; i++) {
//					test.ok(posts[i] instanceof Post);
//					if (posts[i].get('title') === 'post1') {
//						test.equal(posts[i].get('comments'), undefined);
//					} else if (posts[i].get('title') === 'post2') {
//						test.equal(posts[i].get('comments').length, 1);
//						test.equal(posts[i].get('comments')[0] instanceof Comment);
//						test.equal(posts[i].get('comments')[0].get('content'), 'nice!');
//					} else if (posts[i].get('title') === 'post5') {
//						test.equal(posts[i].get('comments').length, 2);
//					}
//				}
//
//				return user2.save();
//			})
//			.then(function (user2) {
//				reheat.unregisterModel('User');
//				reheat.unregisterModel('Post');
//				reheat.unregisterModel('Comment');
//				test.done();
//			})
//			.catch(test.done)
//			.error(test.done);
//	},
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
				return User.get(user.get(User.idAttribute), { with: ['Profile'] });
			})
			.then(function (tempUser) {
				var tempProfile = tempUser.get('profile');
				test.ok(tempProfile instanceof Profile);
				test.equal(tempProfile.get('userId'), tempUser.get(User.idAttribute));
				test.equal(tempProfile.get('email'), profile.get('email'));
				return User.get(user.get(User.idAttribute), { with: ['Post'] });
			})
			.then(function (tempUser) {
				var posts = tempUser.get(User.relations.hasMany.Post.localField);
				test.ok(mout.lang.isArray(posts));
				test.equal(posts.length, 3);

				mout.array.forEach(posts, function (post) {
					test.ok(post instanceof Post);
				});

				var JSONposts = [
					{
						title: 'post1',
						id: post1.get(Post.idAttribute),
						userId: tempUser.get(User.idAttribute)
					},
					{
						title: 'post2',
						id: post2.get(Post.idAttribute),
						userId: tempUser.get(User.idAttribute)
					},
					{
						title: 'post5',
						id: post5.get(Post.idAttribute),
						userId: tempUser.get(User.idAttribute)
					}
				];

				JSONposts.sort(function (a, b) {
					return a.id < b.id;
				});

				var userJSON = tempUser.toJSON();
				userJSON.posts.sort(function (a, b) {
					return a.id < b.id;
				});

				test.deepEqual(userJSON, {
					id: tempUser.get(User.idAttribute),
					name: 'John Anderson',
					posts: JSONposts
				});

//				return User.get(user.get(User.idAttribute), { with: ['Post.Comment'] });
//			})
//			.then(function (tempUser) {
//				test.ok(mout.lang.isArray(tempUser.get(User.relations.hasMany.Post.localField)));
//				test.equal(tempUser.get(User.relations.hasMany.Post.localField).length, 3);
//
				return User.get(user.get(User.idAttribute), { with: ['Post', 'Comment'] });
			})
			.then(function (tempUser) {
				var posts = tempUser.get(User.relations.hasMany.Post.localField),
					comments = tempUser.get(User.relations.hasMany.Comment.localField);

				test.ok(mout.lang.isArray(posts));
				test.ok(mout.lang.isArray(comments));
				test.equal(posts.length, 3);
				test.equal(comments.length, 5);

				mout.array.forEach(posts, function (post) {
					test.ok(post instanceof Post);
				});

				mout.array.forEach(comments, function (comment) {
					test.ok(comment instanceof Comment);
				});

				var JSONposts = [
					{
						title: 'post1',
						id: post1.get(Post.idAttribute),
						userId: tempUser.get(User.idAttribute)
					},
					{
						title: 'post2',
						id: post2.get(Post.idAttribute),
						userId: tempUser.get(User.idAttribute)
					},
					{
						title: 'post5',
						id: post5.get(Post.idAttribute),
						userId: tempUser.get(User.idAttribute)
					}
				];

				JSONposts.sort(function (a, b) {
					return a.id < b.id;
				});

				var JSONcomments = [
					{
						id: comment1.get(Comment.idAttribute),
						postId: post2.get(Post.idAttribute),
						userId: tempUser.get(User.idAttribute),
						content: comment1.get('content')
					},
					{
						id: comment2.get(Comment.idAttribute),
						postId: post5.get(Post.idAttribute),
						userId: tempUser.get(User.idAttribute),
						content: comment2.get('content')
					},
					{
						id: comment3.get(Comment.idAttribute),
						postId: post5.get(Post.idAttribute),
						userId: tempUser.get(User.idAttribute),
						content: comment3.get('content')
					},
					{
						id: comment4.get(Comment.idAttribute),
						postId: post5.get(Post.idAttribute),
						userId: tempUser.get(User.idAttribute),
						content: comment4.get('content')
					},
					{
						id: comment5.get(Comment.idAttribute),
						postId: post5.get(Post.idAttribute),
						userId: tempUser.get(User.idAttribute),
						content: comment5.get('content')
					}
				];

				JSONcomments.sort(function (a, b) {
					return a.id < b.id;
				});

				var userJSON = tempUser.toJSON();
				userJSON.posts.sort(function (a, b) {
					return a.id < b.id;
				});
				userJSON.comments.sort(function (a, b) {
					return a.id < b.id;
				});

				test.deepEqual(userJSON, {
					id: tempUser.get(User.idAttribute),
					name: 'John Anderson',
					posts: JSONposts,
					comments: JSONcomments
				});

				return User.get(user2.get(User.idAttribute), { with: ['Profile'] });
			})
			// test the second user
			.then(function (tempUser2) {
				var tempProfile2 = tempUser2.get('profile');
				test.ok(tempProfile2 instanceof Profile);
				test.equal(tempProfile2.get('userId'), tempUser2.get(User.idAttribute));
				test.equal(tempProfile2.get('email'), profile2.get('email'));
				return User.get(user2.get(User.idAttribute), { with: ['Post'] });
			})
			.then(function (tempUser2) {
				var posts = tempUser2.get(User.relations.hasMany.Post.localField);
				test.ok(mout.lang.isArray(posts));
				test.equal(posts.length, 2);

				mout.array.forEach(posts, function (post) {
					test.ok(post instanceof Post);
				});

				var JSONposts = [
					{
						title: 'post3',
						id: post3.get(Post.idAttribute),
						userId: tempUser2.get(User.idAttribute)
					},
					{
						title: 'post4',
						id: post4.get(Post.idAttribute),
						userId: tempUser2.get(User.idAttribute)
					}
				];

				JSONposts.sort(function (a, b) {
					return a.id < b.id;
				});

				var userJSON = tempUser2.toJSON();
				userJSON.posts.sort(function (a, b) {
					return a.id < b.id;
				});

				test.deepEqual(userJSON, {
					id: tempUser2.get(User.idAttribute),
					name: 'Sally Jones',
					posts: JSONposts
				});
//
//				return User.get(user2.get(User.idAttribute), { with: ['Post.Comment'] });
//			})
//			.then(function (tempUser2) {
//				test.ok(mout.lang.isArray(tempUser2.get(User.relations.hasMany.Post.localField)));
//				test.equal(tempUser2.get(User.relations.hasMany.Post.localField).length, 2);
//
				return User.get(user2.get(User.idAttribute), { with: ['Post', 'Comment'] });
			})
			.then(function (tempUser2) {
				var posts = tempUser2.get(User.relations.hasMany.Post.localField),
					comments = tempUser2.get(User.relations.hasMany.Comment.localField);

				test.ok(mout.lang.isArray(posts));
				test.ok(mout.lang.isArray(comments));
				test.equal(posts.length, 2);
				test.equal(comments.length, 3);

				mout.array.forEach(posts, function (post) {
					test.ok(post instanceof Post);
				});

				mout.array.forEach(comments, function (comment) {
					test.ok(comment instanceof Comment);
				});

				var JSONposts = [
					{
						title: 'post3',
						id: post3.get(Post.idAttribute),
						userId: tempUser2.get(User.idAttribute)
					},
					{
						title: 'post4',
						id: post4.get(Post.idAttribute),
						userId: tempUser2.get(User.idAttribute)
					}
				];

				JSONposts.sort(function (a, b) {
					return a.id < b.id;
				});

				var JSONcomments = [
					{
						id: comment6.get(Comment.idAttribute),
						postId: post3.get(Post.idAttribute),
						userId: tempUser2.get(User.idAttribute),
						content: comment6.get('content')
					},
					{
						id: comment7.get(Comment.idAttribute),
						postId: post3.get(Post.idAttribute),
						userId: tempUser2.get(User.idAttribute),
						content: comment7.get('content')
					},
					{
						id: comment8.get(Comment.idAttribute),
						postId: post3.get(Post.idAttribute),
						userId: tempUser2.get(User.idAttribute),
						content: comment8.get('content')
					}
				];

				JSONcomments.sort(function (a, b) {
					return a.id < b.id;
				});

				var userJSON = tempUser2.toJSON();
				userJSON.posts.sort(function (a, b) {
					return a.id < b.id;
				});
				userJSON.comments.sort(function (a, b) {
					return a.id < b.id;
				});

				test.deepEqual(userJSON, {
					id: tempUser2.get(User.idAttribute),
					name: 'Sally Jones',
					posts: JSONposts,
					comments: JSONcomments
				});
				return Post.get(post3.get(Post.idAttribute), { with: ['User', 'Comment'] });
			})
			// test post3
			.then(function (tempPost) {
				var tempUser2 = tempPost.get('user'),
					tempComments = tempPost.get('comments');

				test.ok(tempUser2 instanceof User);
				test.equal(tempUser2.get('id'), user2.get(User.idAttribute));
				test.equal(tempUser2.get('name'), user2.get('name'));
				test.equal(tempPost.get('comments').length, 3);

				return Comment.get(comment2.get(Comment.idAttribute), { with: ['Post', 'User'] });
			})
			// test comment2
			.then(function (tempComment) {
				var tempUser = tempComment.get('user'),
					tempPost = tempComment.get('post');

				test.ok(tempComment instanceof Comment);
				test.equal(tempUser.get(User.idAttribute), user.get(User.idAttribute));
				test.equal(tempPost.get(Post.idAttribute), post5.get(Post.idAttribute));

//				return Post.filter({ with: ['User', 'Comment']});
//			})
//			// test the posts
//			.then(function (posts) {
//				test.equal(posts.length, 5);
//
//				for (var i = 0; i < posts.length; i++) {
//					if (posts[i].get(Post.idAttribute) === post1.get(Post.idAttribute)) {
//						test.equal(posts[i].get(Post.relations.belongsTo.User.localField).get(User.idAttribute) === user.get(User.idAttribute));
//					} else if (posts[i].get(Post.idAttribute) === post2.get(Post.idAttribute)) {
//						test.equal(posts[i].get(Post.relations.belongsTo.User.localField).get(User.idAttribute) === user.get(User.idAttribute));
//					} else if (posts[i].get(Post.idAttribute) === post3.get(Post.idAttribute)) {
//						test.equal(posts[i].get(Post.relations.belongsTo.User.localField).get(User.idAttribute) === user2.get(User.idAttribute));
//					} else if (posts[i].get(Post.idAttribute) === post4.get(Post.idAttribute)) {
//						test.equal(posts[i].get(Post.relations.belongsTo.User.localField).get(User.idAttribute) === user2.get(User.idAttribute));
//					} else if (posts[i].get(Post.idAttribute) === post5.get(Post.idAttribute)) {
//						test.equal(posts[i].get(Post.relations.belongsTo.User.localField).get(User.idAttribute) === user.get(User.idAttribute));
//					}
//				}
//
//				return Post.filter({ with: ['Comment']});
//			})
//			.then(function (posts) {
//				test.equal(posts.length, 5);
//
//				for (var i = 0; i < posts.length; i++) {
//					test.isUndefined(posts[i].get(Post.relations.belongsTo.User.localField));
//				}
//
//				return Post.get(post1.get(Post.idAttribute), { with: ['User', 'Comment']});
//			})
//			// test individual posts
//			.then(function (post) {
//				test.equal(post.get(Post.relations.hasMany.Comment.localField).length, 0);
//
////				return Post.get(post1.get(Post.idAttribute), { with: ['User', 'Comment']});
//			})
//			.then(function () {
				test.done();
			})
			.catch(test.done)
			.error(test.done);
	}
};
