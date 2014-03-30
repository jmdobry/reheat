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
		it('should clone a collection', function (done) {
			Users.filter({})
				.then(function (users) {
					var clone = users.clone();
					clone.test = 'test';

					assert.isFalse(clone === users);
					assert.deepEqual(clone.toJSON(), users.toJSON());
					assert.equal(clone.test, 'test');
					assert.isUndefined(users.test);
					done();
				})
				.catch(done)
				.error(done);
		});
		it('calls toJSON() on relations', function (done) {
			Users.filter({}, { with: ['Profile', 'Post' ] })
				.then(function (users) {
					var clone = users.clone();
					clone.test = 'test';
					clone.models[0].get('profile').test = 'test';
					clone.models[1].get('profile').test = 'test';
					clone.models[0].get('posts').test = 'test';
					clone.models[1].get('posts').test = 'test';

					assert.isFalse(clone === users);
					assert.isFalse(clone.models[0].get('profile') === users.models[0].get('profile'));
					assert.deepEqual(clone.toJSON(), users.toJSON());
					assert.equal(clone.test, 'test');
					assert.equal(clone.models[0].get('profile').test, 'test');
					assert.equal(clone.models[1].get('profile').test, 'test');
					assert.equal(clone.models[0].get('posts').test, 'test');
					assert.equal(clone.models[1].get('posts').test, 'test');
					assert.isUndefined(users.test);
					assert.isUndefined(users.models[0].get('profile').test);
					assert.isUndefined(users.models[1].get('profile').test);
					assert.isUndefined(users.models[0].get('posts').test);
					assert.isUndefined(users.models[1].get('posts').test);
					done();
				})
				.catch(done)
				.error(done);
		});
	};
};
