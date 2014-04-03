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

		it('should delete a single row', function (done) {
			Post.destroyOne(testData.post4.get(Post.idAttribute))
				.then(function (result) {
					assert.deepEqual(result, {
						deleted: 1,
						errors: 0,
						inserted: 0,
						replaced: 0,
						skipped: 0,
						unchanged: 0
					});
					return Post.findOne(testData.post4.get(Post.idAttribute));
				})
				.then(function (post) {
					assert.isNull(post);
					done();
				})
				.catch(done)
				.error(done);
		});

		it('should delete a single row and a hasOne relationship', function (done) {
			User.destroyOne(testData.user1.get(User.idAttribute), { with: ['Profile'] })
				.then(function (result) {
					assert.deepEqual(result, {
						deleted: 1,
						errors: 0,
						inserted: 0,
						replaced: 0,
						skipped: 0,
						unchanged: 0
					});
					return User.findOne(testData.post1.get(User.idAttribute));
				})
				.then(function (user) {
					assert.isNull(user);
					return Post.findOne(testData.profile1.get(Profile.idAttribute));
				})
				.then(function (profile) {
					assert.isNull(profile);
					done();
				})
				.catch(done)
				.error(done);
		});

		it('should delete a single row and a hasMany relationship', function (done) {
			Post.destroyOne(testData.post5.get(Post.idAttribute), { with: ['Comment'] })
				.then(function (result) {
					assert.deepEqual(result, {
						deleted: 1,
						errors: 0,
						inserted: 0,
						replaced: 0,
						skipped: 0,
						unchanged: 0
					});
					return Post.findOne(testData.post5.get(Post.idAttribute));
				})
				.then(function (post) {
					assert.isNull(post);
					return Comments.getAll([testData.post5.get(Post.idAttribute)], { index: 'postId' });
				})
				.then(function (comments) {
					assert.equal(comments.size(), 0);
					return Comment.findOne(testData.comment2.get(Comment.idAttribute));
				})
				.then(function (comment) {
					assert.isNull(comment);
					return Comment.findOne(testData.comment3.get(Comment.idAttribute));
				})
				.then(function (comment) {
					assert.isNull(comment);
					return Comment.findOne(testData.comment4.get(Comment.idAttribute));
				})
				.then(function (comment) {
					assert.isNull(comment);
					return Comment.findOne(testData.comment5.get(Comment.idAttribute));
				})
				.then(function (comment) {
					assert.isNull(comment);
					done();
				})
				.catch(done)
				.error(done);
		});

		it('should delete a single row and multiple relationships', function (done) {
			User.destroyOne(testData.user1.get(User.idAttribute), { with: ['Profile', 'Post', 'Comment'] })
				.then(function (result) {
					assert.deepEqual(result, {
						deleted: 1,
						errors: 0,
						inserted: 0,
						replaced: 0,
						skipped: 0,
						unchanged: 0
					});
					return User.findOne(testData.user1.get(User.idAttribute));
				})
				.then(function (user) {
					assert.isNull(user);
					return Posts.getAll([testData.user1.get(User.idAttribute)], { index: 'userId' });
				})
				.then(function (posts) {
					assert.equal(posts.size(), 0);
					return Post.findOne(testData.post1.get(Post.idAttribute));
				})
				.then(function (post) {
					assert.isNull(post);
					return Post.findOne(testData.post2.get(Post.idAttribute));
				})
				.then(function (post) {
					assert.isNull(post);
					return Post.findOne(testData.post5.get(Post.idAttribute));
				})
				.then(function (post) {
					assert.isNull(post);
					return Comments.getAll([testData.user1.get(User.idAttribute)], { index: 'userId' });
				})
				.then(function (comments) {
					assert.equal(comments.size(), 0);
					return Comment.findOne(testData.comment2.get(Comment.idAttribute));
				})
				.then(function (comment) {
					assert.isNull(comment);
					return Comment.findOne(testData.comment3.get(Comment.idAttribute));
				})
				.then(function (comment) {
					assert.isNull(comment);
					return Comment.findOne(testData.comment4.get(Comment.idAttribute));
				})
				.then(function (comment) {
					assert.isNull(comment);
					return Comment.findOne(testData.comment5.get(Comment.idAttribute));
				})
				.then(function (comment) {
					assert.isNull(comment);
					done();
				})
				.catch(done)
				.error(done);
		});
	};
};
