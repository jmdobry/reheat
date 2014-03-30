module.exports = function (container, assert) {
	return function () {

		var User, Profile, Post, Comment, Users, Posts, Comments, Profiles;

		beforeEach(function () {
			User = container.get('User');
			Profile = container.get('Profile');
			Post = container.get('Post');
			Comment = container.get('Comment');
			Users = container.get('Users');
			Posts = container.get('Posts');
			Comments = container.get('Comments');
			Profiles = container.get('Profiles');
		});

		container.register('integration_collection_prototype_toJSON_test', require('./toJSON.test'));
		container.register('integration_collection_prototype_functions_test', require('./functions.test'));
		container.register('integration_collection_prototype_clone_test', require('./clone.test'));
		container.register('integration_collection_prototype_hasNew_test', require('./hasNew.test'));
		container.register('integration_collection_prototype_getByPrimaryKey_test', require('./getByPrimaryKey.test'));

		describe('toJSON', container.get('integration_collection_prototype_toJSON_test'));
		describe('functions', container.get('integration_collection_prototype_functions_test'));
		describe('clone', container.get('integration_collection_prototype_clone_test'));
		describe('hasNew', container.get('integration_collection_prototype_hasNew_test'));
		describe('getByPrimaryKey', container.get('integration_collection_prototype_getByPrimaryKey_test'));
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
			it('no tests yet!');
		});
		describe('reject', function () {
			it('no tests yet!');
		});
		describe('shuffle', function () {
			it('no tests yet!');
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
