/*jshint loopfunc:true*/

var Connection = require('../../../../build/instrument/lib/connection'),
	reheat = require('../../../../build/instrument/lib'),
	support = require('../../../support/support.js'),
	r = require('rethinkdb'),
	sinon = require('sinon'),
	mout = require('mout'),
	connection = new Connection(),
	Promise = require('bluebird'),
	tables = ['user', 'post', 'comment'],
	User, Post, Comment;

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
				post1.setSync('userId', user.get(User.idAttribute));
				post2.setSync('userId', user.get(User.idAttribute));
				post5.setSync('userId', user.get(User.idAttribute));
				comment1.setSync('userId', user.get(User.idAttribute));
				comment2.setSync('userId', user.get(User.idAttribute));
				comment3.setSync('userId', user.get(User.idAttribute));
				comment4.setSync('userId', user.get(User.idAttribute));
				comment5.setSync('userId', user.get(User.idAttribute));
				return Promise.all([
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
				post3.setSync('userId', user2.get(User.idAttribute));
				post4.setSync('userId', user2.get(User.idAttribute));
				comment6.setSync('userId', user2.get(User.idAttribute));
				comment7.setSync('userId', user2.get(User.idAttribute));
				comment8.setSync('userId', user2.get(User.idAttribute));
				return Promise.all([
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
				return User.get(user.get(User.idAttribute), { with: ['Post'] });
			})
			.then(function (tempUser) {
				var posts = tempUser.get(User.relations.hasMany.Post.localField);
				test.ok(mout.lang.isArray(posts));
				test.equal(posts.length, 3);

				mout.array.forEach(posts, function (post) {
					test.ok(post instanceof Post);
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

				return User.get(user2.get(User.idAttribute), { with: ['Post'] });
			})
			// test the second user
			.then(function (tempUser2) {
				var posts = tempUser2.get(User.relations.hasMany.Post.localField);
				test.ok(mout.lang.isArray(posts));
				test.equal(posts.length, 2);

				mout.array.forEach(posts, function (post) {
					test.ok(post instanceof Post);
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
