module.exports = function (container, assert, mout, support, errors) {
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

		describe('toJSON', function () {
			it('returns correct value', function (done) {
				Users.filter({ limit: 1 })
					.then(function (users) {
						assert.deepEqual(users.toJSON(), [
							users.models[0].toJSON()
						]);
						done();
					})
					.catch(done)
					.error(done);
			});
			it('calls toJSON() on relations', function (done) {
				Users.filter({ limit: 1 }, { with: ['Profile', 'Post' ] })
					.then(function (users) {
						var user = users.models[0];

						assert.deepEqual(users.toJSON(), [
							{
								id: user.get(User.idAttribute),
								name: user.get('name'),
								posts: user.get('posts').toJSON(),
								profile: user.get('profile').toJSON()
							}
						]);
						done();
					})
					.catch(done)
					.error(done);
			});
		});
		describe('functions', function () {
			it('returns the correct list of functions', function () {
				var posts = new Posts();

				assert.deepEqual(posts.functions(), [
					'clone',
					'constructor',
					'every',
					'filter',
					'find',
					'findIndex',
					'findLast',
					'findLastIndex',
					'forEach',
					'functions',
					'getByPrimaryKey',
					'hasNew',
					'initialize',
					'invoke',
					'map',
					'pluck',
					'reduce',
					'reject',
					'remove',
					'reset',
					'shuffle',
					'size',
					'slice',
					'some',
					'sort',
					'sortBy',
					'split',
					'toJSON',
					'toLookup',
					'unique'
				]);
			});
		});
		describe('clone', function () {
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
		});
		describe('hasNew', function () {
			it('should not have anything new', function (done) {
				Users.filter({})
					.then(function (users) {
						assert.isFalse(users.hasNew());
						done();
					})
					.catch(done)
					.error(done);
			});
			it('should have some new', function (done) {
				var newUser = new User({
					name: 'Fred Frank'
				});
				var newPost = new User({
					author: 'Fred Frank'
				});

				Users.filter({}, { with: ['Profile', 'Post' ] })
					.then(function (users) {
						assert.isFalse(users.hasNew());
						assert.isFalse(users.models[0].get('posts').hasNew());
						users.models.push(newUser);
						users.models[0].get('posts').models.push(newPost);
						assert.isTrue(users.hasNew());
						assert.isTrue(users.models[0].get('posts').hasNew());
						done();
					})
					.catch(done)
					.error(done);
			});
		});
		describe('getByPrimaryKey', function () {
			it('should return undefined if the model is not in the collection', function (done) {
				Users.filter({})
					.then(function (users) {
						assert.isUndefined(users.getByPrimaryKey('12345'));
						done();
					})
					.catch(done)
					.error(done);
			});
			it('should throw an error if "primaryKey" is not a string', function (done) {
				Users.filter({})
					.then(function (users) {
						mout.array.forEach(support.TYPES_EXCEPT_STRING, function (type) {
							assert.throws(function () {
								assert.isUndefined(users.getByPrimaryKey(type));
							}, errors.IllegalArgumentError);
						});
						done();
					})
					.catch(done)
					.error(done);
			});
			it('should return the correct model if it is in the collection', function (done) {
				Users.filter({})
					.then(function (users) {
						assert.deepEqual(users.models[0].toJSON(), users.getByPrimaryKey(users.models[0].get(User.idAttribute)).toJSON());
						assert.deepEqual(users.models[1].toJSON(), users.getByPrimaryKey(users.models[1].get(User.idAttribute)).toJSON());
						done();
					})
					.catch(done)
					.error(done);
			});
		});
		describe('size', function () {
			it('should the correct size', function () {
				var posts = new Posts([
					{ author: 'J' },
					{ author: 'M' },
					{ author: 'D' }
				]);

				assert.equal(posts.models.length, posts.size());
				assert.equal(posts.size(), 3);
			});
		});
		describe('reset', function () {
			it('chouls correctly reset', function () {
				var post = new Post({ author: 'J' });
				var posts = new Posts([
					post,
					{ author: 'M' },
					{ author: 'D' }
				]);

				assert.equal(posts.models.length, posts.size());
				assert.equal(posts.size(), 3);
				assert.deepEqual(posts.models[0].toJSON(), post.toJSON());

				posts.reset([
					{ author: 'S' }
				]);

				assert.equal(posts.models.length, posts.size());
				assert.equal(posts.size(), 1);
				assert.deepEqual(posts.models[0].toJSON(), {
					author: 'S'
				});
			});
		});

		describe('filter', function () {
			it('should filter and return a new collection', function () {
				var posts = new Posts([
					{ author: 'a', title: 'a' },
					{ author: 'a', title: 'b' },
					{ author: 'a', title: 'c' },
					{ author: 'b', title: 'a' },
					{ author: 'b', title: 'b' },
					{ author: 'b', title: 'c' },
					{ author: 'c', title: 'a' },
					{ author: 'c', title: 'b' },
					{ author: 'c', title: 'c' }
				]);

				var filteredPosts = posts.filter(function (post) {
					return post.get('author') === 'a';
				});

				assert.equal(posts.size(), 9);
				assert.isTrue(filteredPosts instanceof Posts);
				assert.isFalse(filteredPosts === posts);
				assert.equal(filteredPosts.size(), 3);
			});
		});
		describe('reject', function () {
			it('should reject and return a new collection', function () {
				var posts = new Posts([
					{ author: 'a', title: 'a' },
					{ author: 'a', title: 'b' },
					{ author: 'a', title: 'c' },
					{ author: 'b', title: 'a' },
					{ author: 'b', title: 'b' },
					{ author: 'b', title: 'c' },
					{ author: 'c', title: 'a' },
					{ author: 'c', title: 'b' },
					{ author: 'c', title: 'c' }
				]);

				var filteredPosts = posts.reject(function (post) {
					return post.get('author') === 'a';
				});

				assert.equal(posts.size(), 9);
				assert.isTrue(filteredPosts instanceof Posts);
				assert.isFalse(filteredPosts === posts);
				assert.equal(filteredPosts.size(), 6);
			});
		});
		describe('shuffle', function () {
			it('should shuffle and return a new collection', function () {
				var posts = new Posts([
					{ author: 'a', title: 'a', order: 0 },
					{ author: 'a', title: 'b', order: 1 },
					{ author: 'a', title: 'c', order: 2 },
					{ author: 'b', title: 'a', order: 3 },
					{ author: 'b', title: 'b', order: 4 },
					{ author: 'b', title: 'c', order: 5 },
					{ author: 'c', title: 'a', order: 6 },
					{ author: 'c', title: 'b', order: 7 },
					{ author: 'c', title: 'c', order: 8 }
				]);

				var shuffledPosts = posts.shuffle();

				assert.equal(posts.size(), 9);
				assert.isTrue(shuffledPosts instanceof Posts);
				assert.isFalse(shuffledPosts === posts);
				assert.equal(shuffledPosts.size(), 9);

				var sameOrder = true;
				shuffledPosts.forEach(function (post, index) {
					if (post.get('order') !== posts.models[index].order) {
						sameOrder = false;
					}
				});
				assert.isFalse(sameOrder, 'the two arrays should not have the same order');
			});
		});
		describe('slice', function () {
			it('no tests yet!');
		});
		describe('sort', function () {
			it('no tests yet!');
		});
		describe('sortBy', function () {
			it('no tests yet!');
		});
		describe('unique', function () {
			it('no tests yet!');
		});
		describe('every', function () {
			it('no tests yet!');
		});
		describe('find', function () {
			it('no tests yet!');
		});
		describe('findLast', function () {
			it('no tests yet!');
		});
		describe('findIndex', function () {
			it('no tests yet!');
		});
		describe('findLastIndex', function () {
			it('no tests yet!');
		});
		describe('forEach', function () {
			it('no tests yet!');
		});
		describe('invoke', function () {
			it('no tests yet!');
		});
		describe('map', function () {
			it('no tests yet!');
		});
		describe('pluck', function () {
			it('no tests yet!');
		});
		describe('reduce', function () {
			it('no tests yet!');
		});
		describe('remove', function () {
			it('no tests yet!');
		});
		describe('some', function () {
			it('no tests yet!');
		});
		describe('split', function () {
			it('no tests yet!');
		});
		describe('toLookup', function () {
			it('no tests yet!');
		});
	};
};
