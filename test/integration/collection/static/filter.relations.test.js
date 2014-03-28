module.exports = function (container, Promise, assert) {
	return function () {

		var User, Profile, Post, Comment, Users, Posts, Comments, Profiles,
			user,
			user2,
			profile,
			profile2,
			post1,
			post2,
			post3,
			post5,
			post4,
			comment1,
			comment2,
			comment3,
			comment4,
			comment5,
			comment6,
			comment7,
			comment8;

		beforeEach(function (done) {
			User = container.get('User');
			Profile = container.get('Profile');
			Post = container.get('Post');
			Comment = container.get('Comment');
			Users = container.get('Users');
			Posts = container.get('Posts');
			Comments = container.get('Comments');
			Profiles = container.get('Profiles');

			user = new User({
				name: 'John Anderson'
			});
			user2 = new User({
				name: 'Sally Jones'
			});
			profile = new Profile({
				email: 'john.anderson@example.com'
			});
			profile2 = new Profile({
				email: 'sally.jones@example.com'
			});
			post1 = new Post({
				title: 'post1'
			});
			post2 = new Post({
				title: 'post2'
			});
			post5 = new Post({
				title: 'post5'
			});
			post3 = new Post({
				title: 'post3'
			});
			post4 = new Post({
				title: 'post4'
			});
			comment1 = new Comment({
				content: 'sweet!'
			});
			comment2 = new Comment({
				content: 'rad!'
			});
			comment3 = new Comment({
				content: 'awesome!'
			});
			comment4 = new Comment({
				content: 'outstanding!'
			});
			comment5 = new Comment({
				content: 'cool!'
			});
			comment6 = new Comment({
				content: 'wow!'
			});
			comment7 = new Comment({
				content: 'amazing!'
			});
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
				.then(function () {
					done();
				})
				.catch(done)
				.error(done);
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
					assert.equal(users.getByPrimaryKey(user.get(User.idAttribute)).get('posts').size(), 3, 'user 1 should have 3 posts');
					assert.equal(users.getByPrimaryKey(user2.get(User.idAttribute)).get('posts').size(), 2, 'user 2 should have 2 posts');
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
					assert.equal(users.getByPrimaryKey(user.get(User.idAttribute)).get('posts').size(), 3, 'user 1 should have 3 posts');
					assert.equal(users.getByPrimaryKey(user.get(User.idAttribute)).get('comments').size(), 5, 'user 1 should have 5 comments');
					assert.equal(users.getByPrimaryKey(user2.get(User.idAttribute)).get('posts').size(), 2, 'user 2 should have 2 posts');
					assert.equal(users.getByPrimaryKey(user2.get(User.idAttribute)).get('comments').size(), 3, 'user 2 should have 3 comments');
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
					assert.equal(comments.getByPrimaryKey(comment1.get(Comment.idAttribute)).get('user').get(User.idAttribute), user.get(User.idAttribute));
					assert.equal(comments.getByPrimaryKey(comment1.get(Comment.idAttribute)).get('post').get(Post.idAttribute), post2.get(Post.idAttribute));
					assert.equal(comments.getByPrimaryKey(comment8.get(Comment.idAttribute)).get('user').get(User.idAttribute), user2.get(User.idAttribute));
					done();
				})
				.catch(done)
				.error(done);
		});
	};
};
