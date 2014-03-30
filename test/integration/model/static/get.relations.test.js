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
			User.get(user2.get(User.idAttribute), { with: ['Profile'] })
				.then(function (user) {
					assert.isTrue(user instanceof User, 'should return an instance of "User"');
					assert.equal(user.get(User.idAttribute), user2.get(User.idAttribute), 'should be the right user');
					assert.equal(user.get('name'), user2.get('name'), 'should be have the right name');
					assert.isTrue(user.get('profile') instanceof Profile, 'user.get("profile") should be an instance of "Profile"');
					assert.equal(user.get('profile').get(Profile.idAttribute), profile2.get(Profile.idAttribute), 'should have the right profile');
					done();
				})
				.catch(done)
				.error(done);
		});

		it('correctly retrieves a single hasMany relationship', function (done) {
			User.get(user2.get(User.idAttribute), { with: ['Post'] })
				.then(function (user) {
					assert.isTrue(user instanceof User, 'should return an instance of "User"');
					assert.equal(user.get(User.idAttribute), user2.get(User.idAttribute), 'should be the right user');
					assert.equal(user.get('name'), user2.get('name'), 'should be have the right name');
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
			User.get(user2.get(User.idAttribute), { with: ['Profile', 'Post', 'Comment'] })
				.then(function (user) {
					assert.isTrue(user instanceof User, 'should return an instance of "User"');
					assert.equal(user.get(User.idAttribute), user2.get(User.idAttribute), 'should be the right user');
					assert.equal(user.get('name'), user2.get('name'), 'should be have the right name');

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
			Profile.get(profile2.get(Profile.idAttribute), { with: ['User'] })
				.then(function (profile) {
					assert.isTrue(profile instanceof Profile, 'should return an instance of "Profile"');
					assert.deepEqual(profile.get(Profile.idAttribute), profile2.get(Profile.idAttribute), 'should be the right profile');
					assert.deepEqual(profile.get('email'), profile2.get('email'), 'should be the right profile');
					var user = profile.get('user');
					assert.isTrue(user instanceof User, 'profile.get("user") should be an instance of "User"');
					assert.equal(user.get(User.idAttribute), user2.get(User.idAttribute), 'should be the right user');
					done();
				})
				.catch(done)
				.error(done);
		});

		it('correctly retrieves multiple belongsTo relationships', function (done) {
			Comment.get(comment8.get(Comment.idAttribute), { with: ['User', 'Post'] })
				.then(function (comment) {
					assert.isTrue(comment instanceof Comment, 'should return an instance of "Comment"');
					assert.deepEqual(comment.get(Comment.idAttribute), comment8.get(Comment.idAttribute), 'should be the right comment');
					assert.deepEqual(comment.get('content'), comment8.get('content'), 'should be the right comment');

					var user = comment.get('user'),
						post = comment.get('post');

					assert.isTrue(user instanceof User, 'comment.get("user") should be an instance of "User"');
					assert.isTrue(post instanceof Post, 'comment.get("post") should be an instance of "Post"');

					assert.equal(post.get(Post.idAttribute), post3.get(Post.idAttribute));
					assert.equal(user.get(User.idAttribute), user2.get(User.idAttribute));
					done();
				})
				.catch(done)
				.error(done);
		});
	};
};
