module.exports = function (container, Promise, assert, mout, support, errors) {
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

		it('should retrieve a single row without relations', function (done) {
			Post.findOne(testData.post1.get(Post.idAttribute), { profile: true })
				.then(function (post) {
					assert.isTrue(mout.lang.isArray(post.queries));
					assert.equal(post.queries.length, 1);
					assert.isTrue(post instanceof Post, 'should be an instance of "Post"');
					assert.deepEqual(post.toJSON(), testData.post1.toJSON(), 'should retrieve the right post');
					assert.isUndefined(post.get('user'), 'should not have retrieved a user');
					assert.isUndefined(post.get('comments'), 'should not have retrieved any comments');
					done();
				})
				.catch(done)
				.error(done);
		});

		it('should accept empty options', function (done) {
			Post.findOne(testData.post1.get(Post.idAttribute), function (err, post) {
				if (err) {
					return done(err);
				} else {
					assert.deepEqual(post.toJSON(), testData.post1.toJSON(), 'should retrieve the right post');
					assert.isUndefined(post.get('user'), 'should not have retrieved a user');
					assert.isUndefined(post.get('comments'), 'should not have retrieved any comments');
					return done();
				}
			});
		});

		it('should throw errors for illegal arguments', function (done) {
			mout.array.forEach(support.TYPES_EXCEPT_FUNCTION, function (type) {
				assert.throws(function () {
					Post.findOne(testData.post1.get(Post.idAttribute), {}, type || true);
				}, errors.IllegalArgumentError, 'Model.findOne(primaryKey[, options][, cb]): cb: Must be a function!');
			});

			var tasks = [];

			mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
				tasks.push(assert.isRejected(Post.findOne(type), errors.IllegalArgumentError, 'Model.findOne(primaryKey[, options][, cb]): primaryKey: Must be a string!'));
			});

			mout.array.forEach(support.TYPES_EXCEPT_OBJECT, function (type) {
				if (!mout.lang.isFunction(type)) {
					tasks.push(assert.isRejected(Post.findOne(testData.post1.get(Post.idAttribute), type || true), errors.IllegalArgumentError, 'Model.findOne(primaryKey[, options][, cb]): options: Must be an object!'));
				}
			});

			mout.array.forEach(support.TYPES_EXCEPT_ARRAY, function (type) {
				if (!mout.lang.isFunction(type)) {
					tasks.push(assert.isRejected(Post.findOne(testData.post1.get(Post.idAttribute), {
						with: type || true
					}), errors.IllegalArgumentError, 'Model.findOne(primaryKey[, options][, cb]): options.with: Must be an array!'));
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
			Post.findOne(testData.post1.get(Post.idAttribute), { raw: true })
				.then(function (post) {
					assert.isFalse(post instanceof Post, 'should not be an instance of "Post"');
					assert.deepEqual(post, testData.post1.toJSON(), 'should retrieve the right post');
					assert.isUndefined(post.user, 'should not have retrieved a user');
					assert.isUndefined(post.comments, 'should not have retrieved any comments');
					done();
				})
				.catch(done)
				.error(done);
		});
	};
};
