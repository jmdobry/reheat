module.exports = function (container, assert, mout) {
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

		it('should not try to destroy a new instance', function (done) {
			var post = new Post({
				author: 'John Anderson',
				address: {
					state: 'NY'
				}
			});

			assert.isTrue(post.isNew());

			post.destroy()
				.then(function (post) {
					assert.deepEqual(post.toJSON(), {
						author: 'John Anderson',
						address: {
							state: 'NY'
						}
					});
					assert.isTrue(post.isNew());
					assert.isUndefined(post.meta);

					done();
				})
				.catch(done)
				.error(done);
		});

		it('should destroy an already saved instance', function (done) {
			var post = new Post({
				author: 'John Anderson',
				address: {
					state: 'NY'
				}
			});

			assert.isTrue(post.isNew());

			post.save()
				.then(function (post) {
					assert.isFalse(post.isNew());
					return post.destroy();
				})
				.then(function (post) {
					assert.deepEqual(post.toJSON(), {
						author: 'John Anderson',
						address: {
							state: 'NY'
						}
					});
					assert.isTrue(post.isNew());
					assert.isNull(post.meta.new_val);
					assert.equal(post.meta.deleted, 1);

					done();
				})
				.catch(done)
				.error(done);
		});

		it('should soft destroy an already saved instance with softDelete', function (done) {
			Post.softDelete = true;

			var post = new Post({
				author: 'John Anderson',
				address: {
					state: 'NY'
				}
			});

			assert.isTrue(post.isNew());

			post.save()
				.then(function (post) {
					assert.isFalse(post.isNew());
					return post.destroy();
				})
				.then(function (post) {
					assert.deepEqual(post.toJSON(), {
						id: post.get(Post.idAttribute),
						author: 'John Anderson',
						address: {
							state: 'NY'
						},
						deleted: post.get('deleted')
					});
					assert.isTrue(mout.lang.isDate(post.get('deleted')));
					assert.isFalse(post.isNew());
					assert.equal(post.meta.replaced, 1);

					Post.softDelete = false;
					done();
				})
				.catch(done)
				.error(done);
		});

		it('should soft destroy an already saved instance with softDelete and timestamps', function (done) {
			Post.softDelete = true;
			Post.timestamps = true;

			var post = new Post({
				author: 'John Anderson',
				address: {
					state: 'NY'
				}
			});

			assert.isTrue(post.isNew());

			post.save()
				.then(function (post) {
					assert.isFalse(post.isNew());
					assert.deepEqual(post.get('created'), post.get('updated'));
					return post.destroy();
				})
				.then(function (post) {
					assert.deepEqual(post.toJSON(), {
						id: post.get(Post.idAttribute),
						author: 'John Anderson',
						address: {
							state: 'NY'
						},
						created: post.get('created'),
						updated: post.get('updated'),
						deleted: post.get('deleted')
					});
					assert.isTrue(mout.lang.isDate(post.get('created')));
					assert.isTrue(mout.lang.isDate(post.get('updated')));
					assert.isTrue(mout.lang.isDate(post.get('deleted')));
					assert.notDeepEqual(post.get('created'), post.get('updated'));
					assert.deepEqual(post.get('updated'), post.get('deleted'));
					assert.isFalse(post.isNew());
					assert.equal(post.meta.replaced, 1);

					Post.softDelete = false;
					Post.timestamps = false;
					done();
				})
				.catch(done)
				.error(done);
		});
	};
};
