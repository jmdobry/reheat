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
			it('should slice and return a new collection', function () {
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

				var sliced = posts.slice(5);

				assert.isTrue(sliced instanceof Posts);
				assert.isFalse(sliced === posts);
				assert.equal(sliced.size(), 4);

				sliced = posts.slice(2, 3);

				assert.isTrue(sliced instanceof Posts);
				assert.isFalse(sliced === posts);
				assert.equal(sliced.size(), 1);
				assert.deepEqual(sliced.models[0].toJSON(), posts.models[2].toJSON());
			});
		});
		describe('sort', function () {
			it('should sort and return a new collection', function () {
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

				var shuffled = new Posts([
					posts.models[8],
					posts.models[4],
					posts.models[5],
					posts.models[1],
					posts.models[7],
					posts.models[2],
					posts.models[6],
					posts.models[3],
					posts.models[0]
				]);

				var sorted = shuffled.sort(function (a, b) {
					return a.get('order') - b.get('order');
				});

				assert.deepEqual(posts.models[0].toJSON(), sorted.models[0].toJSON());
				assert.deepEqual(posts.models[1].toJSON(), sorted.models[1].toJSON());
				assert.deepEqual(posts.models[2].toJSON(), sorted.models[2].toJSON());
				assert.deepEqual(posts.models[3].toJSON(), sorted.models[3].toJSON());
				assert.deepEqual(posts.models[4].toJSON(), sorted.models[4].toJSON());
				assert.deepEqual(posts.models[5].toJSON(), sorted.models[5].toJSON());
				assert.deepEqual(posts.models[6].toJSON(), sorted.models[6].toJSON());
				assert.deepEqual(posts.models[7].toJSON(), sorted.models[7].toJSON());
				assert.deepEqual(posts.models[8].toJSON(), sorted.models[8].toJSON());
			});
		});
		describe('sortBy', function () {
			it('should sortBy and return a new collection', function () {
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

				var shuffled = new Posts([
					posts.models[8],
					posts.models[4],
					posts.models[5],
					posts.models[1],
					posts.models[7],
					posts.models[2],
					posts.models[6],
					posts.models[3],
					posts.models[0]
				]);

				var sorted = shuffled.sortBy(function (a) {
					return a.get('order');
				});

				assert.deepEqual(posts.models[0].toJSON(), sorted.models[0].toJSON());
				assert.deepEqual(posts.models[1].toJSON(), sorted.models[1].toJSON());
				assert.deepEqual(posts.models[2].toJSON(), sorted.models[2].toJSON());
				assert.deepEqual(posts.models[3].toJSON(), sorted.models[3].toJSON());
				assert.deepEqual(posts.models[4].toJSON(), sorted.models[4].toJSON());
				assert.deepEqual(posts.models[5].toJSON(), sorted.models[5].toJSON());
				assert.deepEqual(posts.models[6].toJSON(), sorted.models[6].toJSON());
				assert.deepEqual(posts.models[7].toJSON(), sorted.models[7].toJSON());
				assert.deepEqual(posts.models[8].toJSON(), sorted.models[8].toJSON());
			});
		});
		describe('unique', function () {
			it('should remove duplicates and return a new collection', function () {
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

				var uniqueAuthors = posts.unique(function (a, b) {
					return a.get('author') === b.get('author');
				});

				assert.isTrue(uniqueAuthors instanceof Posts);
				assert.isFalse(uniqueAuthors === Posts);
				assert.equal(uniqueAuthors.size(), 3);
				assert.deepEqual(uniqueAuthors.models[0].toJSON(), posts.models[2].toJSON());
				assert.deepEqual(uniqueAuthors.models[1].toJSON(), posts.models[5].toJSON());
				assert.deepEqual(uniqueAuthors.models[2].toJSON(), posts.models[8].toJSON());

				var uniqueTitles = posts.unique(function (a, b) {
					return a.get('title') === b.get('title');
				});

				assert.isTrue(uniqueTitles instanceof Posts);
				assert.isFalse(uniqueTitles === Posts);
				assert.equal(uniqueTitles.size(), 3);
				assert.deepEqual(uniqueTitles.models[0].toJSON(), posts.models[6].toJSON());
				assert.deepEqual(uniqueTitles.models[1].toJSON(), posts.models[7].toJSON());
				assert.deepEqual(uniqueTitles.models[2].toJSON(), posts.models[8].toJSON());

				var uniqueOrders = posts.unique(function (a, b) {
					return a.get('order') === b.get('order');
				});

				assert.isTrue(uniqueOrders instanceof Posts);
				assert.isFalse(uniqueOrders === Posts);
				assert.equal(uniqueOrders.size(), 9);
				assert.deepEqual(uniqueOrders.models[0].toJSON(), posts.models[0].toJSON());
				assert.deepEqual(uniqueOrders.models[1].toJSON(), posts.models[1].toJSON());
				assert.deepEqual(uniqueOrders.models[2].toJSON(), posts.models[2].toJSON());
				assert.deepEqual(uniqueOrders.models[3].toJSON(), posts.models[3].toJSON());
				assert.deepEqual(uniqueOrders.models[4].toJSON(), posts.models[4].toJSON());
				assert.deepEqual(uniqueOrders.models[5].toJSON(), posts.models[5].toJSON());
				assert.deepEqual(uniqueOrders.models[6].toJSON(), posts.models[6].toJSON());
				assert.deepEqual(uniqueOrders.models[7].toJSON(), posts.models[7].toJSON());
				assert.deepEqual(uniqueOrders.models[8].toJSON(), posts.models[8].toJSON());
			});
		});
		describe('every', function () {
			it('should return whether every item in the array passes the callback', function () {
				var posts = new Posts([
					{ author: 'a', title: 'b', order: 1 },
					{ author: 'a', title: 'c', order: 2 },
					{ author: 'b', title: 'a', order: 3 }
				]);

				assert.isFalse(posts.every(function (post) {
					return post.get('order') % 2 === 0;
				}));

				assert.isTrue(posts.every(function (post) {
					return post.isNew();
				}));
			});
		});
		describe('find', function () {
			it('should find the first item that passes the callback', function () {
				var posts = new Posts([
					{ author: 'a', title: 'b', order: 1 },
					{ author: 'a', title: 'c', order: 2 },
					{ author: 'e', title: 'e', order: 2 },
					{ author: 'f', title: 'f', order: 2 },
					{ author: 'b', title: 'a', order: 3 }
				]);

				var found = posts.find(function (post) {
					return post.get('order') === 2;
				});

				assert.deepEqual(found.toJSON(), posts.models[1].toJSON());

				found = posts.find(function (post) {
					return post.get('order') === 999;
				});

				assert.isUndefined(found);
			});
		});
		describe('findLast', function () {
			it('should find the last item that passes the callback', function () {
				var posts = new Posts([
					{ author: 'a', title: 'b', order: 1 },
					{ author: 'a', title: 'c', order: 2 },
					{ author: 'e', title: 'e', order: 2 },
					{ author: 'f', title: 'f', order: 2 },
					{ author: 'b', title: 'a', order: 3 }
				]);

				var found = posts.findLast(function (post) {
					return post.get('order') === 2;
				});

				assert.deepEqual(found.toJSON(), posts.models[3].toJSON());

				found = posts.findLast(function (post) {
					return post ? post.get('order') === 999 : false;
				});

				assert.isUndefined(found);
			});
		});
		describe('findIndex', function () {
			it('no tests yet!');
		});
		describe('findLastIndex', function () {
			it('no tests yet!');
		});
		describe('forEach', function () {
			it('should call "callback" on every item in the collection', function () {
				var posts = new Posts([
					{ author: 'a', title: 'b', order: 1 },
					{ author: 'a', title: 'c', order: 2 },
					{ author: 'b', title: 'a', order: 3 }
				]);

				posts.forEach(function (post) {
					post.setSync('order', post.get('order') * 10);
				});

				assert.equal(posts.models[0].get('order'), 10);
				assert.equal(posts.models[1].get('order'), 20);
				assert.equal(posts.models[2].get('order'), 30);
			});
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
