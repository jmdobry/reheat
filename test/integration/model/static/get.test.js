module.exports = function (container, Promise, assert, mout, support, errors) {
	return function () {

		var testPost, User, Profile, Post, Comment, Users, Posts, Comments, Profiles;

		beforeEach(function (done) {
			User = container.get('User');
			Profile = container.get('Profile');
			Post = container.get('Post');
			Comment = container.get('Comment');
			Users = container.get('Users');
			Posts = container.get('Posts');
			Comments = container.get('Comments');
			Profiles = container.get('Profiles');

			testPost = new Post({
				author: 'John Anderson',
				title: 'How to cook'
			});

			testPost.save()
				.then(function () {
					done();
				})
				.catch(done)
				.error(done);
		});

		it('should retrieve a single row without relations', function (done) {
			Post.get(testPost.get(Post.idAttribute), { profile: true })
				.then(function (post) {
					assert.isTrue(mout.lang.isArray(post.queries));
					assert.equal(post.queries.length, 1);
					assert.isTrue(post instanceof Post, 'should be an instance of "Post"');
					assert.deepEqual(post.toJSON(), testPost.toJSON(), 'should retrieve the right post');
					assert.isUndefined(post.get('user'), 'should not have retrieved a user');
					assert.isUndefined(post.get('comments'), 'should not have retrieved any comments');
					done();
				})
				.catch(done)
				.error(done);
		});

		it('should accept empty options', function (done) {
			Post.get(testPost.get(Post.idAttribute), function (err, post) {
				if (err) {
					return done(err);
				} else {
					assert.deepEqual(post.toJSON(), testPost.toJSON(), 'should retrieve the right post');
					assert.isUndefined(post.get('user'), 'should not have retrieved a user');
					assert.isUndefined(post.get('comments'), 'should not have retrieved any comments');
					return done();
				}
			});
		});

		it('should throw errors for illegal arguments', function (done) {
			mout.array.forEach(support.TYPES_EXCEPT_FUNCTION, function (type) {
				assert.throws(function () {
					Post.get(testPost.get(Post.idAttribute), {}, type || true);
				}, errors.IllegalArgumentError, 'Model.get(primaryKey[, options][, cb]): cb: Must be a function!');
			});

			var tasks = [];

			mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
				tasks.push(assert.isRejected(Post.get(type), errors.IllegalArgumentError, 'Model.get(primaryKey[, options][, cb]): primaryKey: Must be a string!'));
			});

			mout.array.forEach(support.TYPES_EXCEPT_OBJECT, function (type) {
				if (!mout.lang.isFunction(type)) {
					tasks.push(assert.isRejected(Post.get(testPost.get(Post.idAttribute), type || true), errors.IllegalArgumentError, 'Model.get(primaryKey[, options][, cb]): options: Must be an object!'));
				}
			});

			mout.array.forEach(support.TYPES_EXCEPT_ARRAY, function (type) {
				if (!mout.lang.isFunction(type)) {
					tasks.push(assert.isRejected(Post.get(testPost.get(Post.idAttribute), {
						with: type || true
					}), errors.IllegalArgumentError, 'Model.get(primaryKey[, options][, cb]): options.with: Must be an array!'));
				}
			});

			Promise.all(tasks)
				.then(function () {
					done();
				})
				.catch(done)
				.error(done);
		});

		it('should retrieve a single row without relations in raw mode', function (done) {
			Post.get(testPost.get(Post.idAttribute), { raw: true })
				.then(function (post) {
					assert.isFalse(post instanceof Post, 'should not be an instance of "Post"');
					assert.deepEqual(post, testPost.toJSON(), 'should retrieve the right post');
					assert.isUndefined(post.user, 'should not have retrieved a user');
					assert.isUndefined(post.comments, 'should not have retrieved any comments');
					done();
				})
				.catch(done)
				.error(done);
		});
	};
};
