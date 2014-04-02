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
			User.get(testData.user2.get(User.idAttribute), { with: ['Profile'] })
				.then(function (user) {
					assert.isTrue(user instanceof User, 'should return an instance of "User"');
					assert.equal(user.get(User.idAttribute), testData.user2.get(User.idAttribute), 'should be the right user');
					assert.equal(user.get('name'), testData.user2.get('name'), 'should be have the right name');
					assert.isTrue(user.get('profile') instanceof Profile, 'user.get("profile") should be an instance of "Profile"');
					assert.equal(user.get('profile').get(Profile.idAttribute), testData.profile2.get(Profile.idAttribute), 'should have the right profile');
					done();
				})
				.catch(done)
				.error(done);
		});

		it('correctly retrieves a single hasMany relationship', function (done) {
			User.get(testData.user2.get(User.idAttribute), { with: ['Post'] })
				.then(function (user) {
					assert.isTrue(user instanceof User, 'should return an instance of "User"');
					assert.equal(user.get(User.idAttribute), testData.user2.get(User.idAttribute), 'should be the right user');
					assert.equal(user.get('name'), testData.user2.get('name'), 'should be have the right name');
					var posts = user.get('posts');
					assert.isTrue(posts instanceof Posts, 'user.get("posts") should be an instance of "Posts"');
					posts.forEach(function (post) {
						assert.isTrue(post instanceof Post, 'post should be an instance of "Posts"');
					});
					assert.equal(posts.size(), 2, 'user 2 should have 2 posts');
					done();
				})
				.catch(done)
				.error(done);
		});

		it('correctly retrieves multiple relationships', function (done) {
			User.get(testData.user2.get(User.idAttribute), { with: ['Profile', 'Post', 'Comment'] })
				.then(function (user) {
					assert.isTrue(user instanceof User, 'should return an instance of "User"');
					assert.equal(user.get(User.idAttribute), testData.user2.get(User.idAttribute), 'should be the right user');
					assert.equal(user.get('name'), testData.user2.get('name'), 'should be have the right name');

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
					assert.equal(posts.size(), 2, 'user 2 should have 2 posts');
					assert.equal(comments.size(), 3, 'user 2 should have 3 comments');
					done();
				})
				.catch(done)
				.error(done);
		});

		it('correctly retrieves a single belongsTo relationship', function (done) {
			Profile.get(testData.profile2.get(Profile.idAttribute), { with: ['User'] })
				.then(function (profile) {
					assert.isTrue(profile instanceof Profile, 'should return an instance of "Profile"');
					assert.deepEqual(profile.get(Profile.idAttribute), testData.profile2.get(Profile.idAttribute), 'should be the right profile');
					assert.deepEqual(profile.get('email'), testData.profile2.get('email'), 'should be the right profile');
					var user = profile.get('user');
					assert.isTrue(user instanceof User, 'profile.get("user") should be an instance of "User"');
					assert.equal(user.get(User.idAttribute), testData.user2.get(User.idAttribute), 'should be the right user');
					done();
				})
				.catch(done)
				.error(done);
		});

		it('correctly retrieves multiple belongsTo relationships', function (done) {
			Comment.get(testData.comment8.get(Comment.idAttribute), { with: ['User', 'Post'] })
				.then(function (comment) {
					assert.isTrue(comment instanceof Comment, 'should return an instance of "Comment"');
					assert.deepEqual(comment.get(Comment.idAttribute), testData.comment8.get(Comment.idAttribute), 'should be the right comment');
					assert.deepEqual(comment.get('content'), testData.comment8.get('content'), 'should be the right comment');

					var user = comment.get('user'),
						post = comment.get('post');

					assert.isTrue(user instanceof User, 'comment.get("user") should be an instance of "User"');
					assert.isTrue(post instanceof Post, 'comment.get("post") should be an instance of "Post"');

					assert.equal(post.get(Post.idAttribute), testData.post3.get(Post.idAttribute));
					assert.equal(user.get(User.idAttribute), testData.user2.get(User.idAttribute));
					done();
				})
				.catch(done)
				.error(done);
		});
	};
};
