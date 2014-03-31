module.exports = function (container, Promise, assert) {
	return function () {

		var testData, testModels,
			User, Profile, Post, Comment, Users, Posts, Comments, Profiles;

		beforeEach(function () {
			testData = container.get('testData');
			testModels = container.get('testModels');
			User = testModels.User;
			Users = testModels.User.collection;
			Post = testModels.Post;
			Posts = testModels.Post.collection;
			Profile = testModels.Profile;
			Profiles = testModels.Profile.collection;
			Comment = testModels.Comment;
			Comments = testModels.Comment.collection;
		});

		it('correctly retrieves a single hasOne relationship', function (done) {
			Users.filter({}, { with: ['Profile'] })
				.then(function (users) {
					assert.isTrue(users instanceof Users, 'should return an instance of the "Users" collection');
					assert.equal(users.size(), 2, 'should have 2 users');
					users.forEach(function (user) {
						assert.isTrue(user.get('profile') instanceof Profile, 'user.get("profile") should be an instance of "Profile"');
					});
					done();
				})
				.catch(done)
				.error(done);
		});

		it('correctly retrieves a single hasMany relationship', function (done) {
			Users.filter({}, { with: ['Post'] })
				.then(function (users) {
					assert.isTrue(users instanceof Users, 'should return an instance of the "Users" collection');
					assert.equal(users.size(), 2, 'should have 2 users');
					users.forEach(function (user) {
						var posts = user.get('posts');
						assert.isTrue(posts instanceof Posts, 'user.get("posts") should be an instance of "Posts"');
						posts.forEach(function (post) {
							assert.isTrue(post instanceof Post, 'post should be an instance of "Posts"');
						});
					});
					assert.equal(users.getByPrimaryKey(testData.user1.get(User.idAttribute)).get('posts').size(), 3, 'user 1 should have 3 posts');
					assert.equal(users.getByPrimaryKey(testData.user2.get(User.idAttribute)).get('posts').size(), 2, 'user 2 should have 2 posts');
					done();
				})
				.catch(done)
				.error(done);
		});

		it('correctly retrieves multiple relationships', function (done) {
			Users.filter({}, { with: ['Profile', 'Post', 'Comment'] })
				.then(function (users) {
					assert.isTrue(users instanceof Users, 'should return an instance of the "Users" collection');
					assert.equal(users.size(), 2, 'should have 2 users');
					users.forEach(function (user) {
						var posts = user.get('posts'),
							profile = user.get('profile'),
							comments = user.get('comments');

						assert.isTrue(posts instanceof Posts, 'user.get("posts") should be an instance of "Posts"');
						assert.isTrue(profile instanceof Profile, 'user.get("profile") should be an instance of "Profile"');
						assert.isTrue(comments instanceof Comments, 'user.get("comments") should be an instance of "Comments"');
						posts.forEach(function (post) {
							assert.isTrue(post instanceof Post, 'post should be an instance of "Post"');
						});
						comments.forEach(function (comment) {
							assert.isTrue(comment instanceof Comment, 'comment should be an instance of "Comment"');
						});
					});
					assert.equal(users.getByPrimaryKey(testData.user1.get(User.idAttribute)).get('posts').size(), 3, 'user 1 should have 3 posts');
					assert.equal(users.getByPrimaryKey(testData.user1.get(User.idAttribute)).get('comments').size(), 5, 'user 1 should have 5 comments');
					assert.equal(users.getByPrimaryKey(testData.user2.get(User.idAttribute)).get('posts').size(), 2, 'user 2 should have 2 posts');
					assert.equal(users.getByPrimaryKey(testData.user2.get(User.idAttribute)).get('comments').size(), 3, 'user 2 should have 3 comments');
					done();
				})
				.catch(done)
				.error(done);
		});

		it('correctly retrieves a single belongsTo relationship', function (done) {
			Profiles.filter({}, { with: ['User'] })
				.then(function (profiles) {
					assert.isTrue(profiles instanceof Profiles, 'should return an instance of the "Profiles" collection');
					assert.equal(profiles.size(), 2, 'should have 2 profiles');
					profiles.forEach(function (profile) {
						var user = profile.get('user');
						assert.isTrue(user instanceof User, 'profile.get("user") should be an instance of "User"');
					});
					done();
				})
				.catch(done)
				.error(done);
		});

		it('correctly retrieves multiple belongsTo relationships', function (done) {
			Comments.filter({}, { with: ['User', 'Post'] })
				.then(function (comments) {
					assert.isTrue(comments instanceof Comments, 'should return an instance of the "Comments" collection');
					assert.equal(comments.size(), 8, 'should have 8 comments');
					comments.forEach(function (comment) {
						var user = comment.get('user'),
							post = comment.get('post');

						assert.isTrue(user instanceof User, 'comment.get("user") should be an instance of "User"');
						assert.isTrue(post instanceof Post, 'comment.get("post") should be an instance of "Post"');
					});
					assert.equal(comments.getByPrimaryKey(testData.comment1.get(Comment.idAttribute)).get('user').get(User.idAttribute), testData.user1.get(User.idAttribute));
					assert.equal(comments.getByPrimaryKey(testData.comment1.get(Comment.idAttribute)).get('post').get(Post.idAttribute), testData.post2.get(Post.idAttribute));
					assert.equal(comments.getByPrimaryKey(testData.comment8.get(Comment.idAttribute)).get('user').get(User.idAttribute), testData.user2.get(User.idAttribute));
					done();
				})
				.catch(done)
				.error(done);
		});
	};
};
