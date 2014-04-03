module.exports = function (container, assert) {
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

		it('should load a hasOne relationship', function (done) {
			assert.isUndefined(testData.user1.get('profile'));

			testData.user1.load(['Profile'])
				.then(function (user) {
					assert.deepEqual(user.toJSON(), {
						id: testData.user1.get(User.idAttribute),
						name: testData.user1.get('name'),
						profile: {
							id: testData.profile1.get(Profile.idAttribute),
							email: testData.profile1.get('email'),
							userId: testData.user1.get(User.idAttribute)
						}
					});
					assert.isFalse(user.isNew());
					assert.isFalse(user.get('profile').isNew());

					done();
				})
				.catch(done)
				.error(done);
		});

		it('should load a hasMany relationship', function (done) {
			assert.isUndefined(testData.user1.get('posts'));

			testData.user1.load(['Post'])
				.then(function (user) {
					assert.deepEqual(user.toJSON(), {
						id: testData.user1.get(User.idAttribute),
						name: testData.user1.get('name'),
						posts: user.get('posts').toJSON()
					});
					assert.isFalse(user.isNew());
					assert.isFalse(user.get('posts').hasNew());

					return Posts.getAll(user.get(User.idAttribute), { index: 'userId' });
				})
				.then(function (posts) {
					posts.forEach(function (post) {
						assert.deepEqual(post.toJSON(), testData.user1.get('posts').getByPrimaryKey(post.get(Post.idAttribute)).toJSON());
					});
					assert.equal(posts.size(), 3);
					done();
				})
				.catch(done)
				.error(done);
		});

		it('should load multiple relationships', function (done) {
			assert.isUndefined(testData.user1.get('profile'));
			assert.isUndefined(testData.user1.get('posts'));
			assert.isUndefined(testData.user1.get('comments'));

			testData.user1.load(['Profile', 'Post', 'Comment'])
				.then(function (user) {
					assert.deepEqual(user.toJSON(), {
						id: testData.user1.get(User.idAttribute),
						name: testData.user1.get('name'),
						profile: user.get('profile').toJSON(),
						posts: user.get('posts').toJSON(),
						comments: user.get('comments').toJSON()
					});
					assert.isFalse(user.isNew());
					assert.equal(user.get('posts').size(), 3);
					assert.equal(user.get('comments').size(), 5);
					assert.isFalse(user.get('posts').hasNew());
					assert.isFalse(user.get('comments').hasNew());

					return Posts.getAll(user.get(User.idAttribute), { index: 'userId' });
				})
				.then(function (posts) {
					posts.forEach(function (post) {
						assert.deepEqual(post.toJSON(), testData.user1.get('posts').getByPrimaryKey(post.get(Post.idAttribute)).toJSON());
					});
					assert.equal(posts.size(), 3);
					return Comments.getAll(testData.user1.get(User.idAttribute), { index: 'userId' });
				})
				.then(function (comments) {
					assert.deepEqual(comments.toJSON(), testData.user1.get('comments').toJSON());
					done();
				})
				.catch(done)
				.error(done);
		});
	};
};
