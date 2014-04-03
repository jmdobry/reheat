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

		describe('/prototype', function () {
			describe('save', function () {
				container.register('integration_model_prototype_save_test', require('./prototype/save.test'));
				container.register('integration_model_prototype_save_relations_test', require('./prototype/save.relations.test'));
				describe('save.test', container.get('integration_model_prototype_save_test'));
				describe('save.relations.test', container.get('integration_model_prototype_save_relations_test'));
			});
			describe('destroy', function () {
				container.register('integration_model_prototype_destroy_test', require('./prototype/destroy.test'));
				container.register('integration_model_prototype_destroy_relations_test', require('./prototype/destroy.relations.test'));
				describe('destroy.test', container.get('integration_model_prototype_destroy_test'));
				describe('destroy.relations.test', container.get('integration_model_prototype_destroy_relations_test'));
			});

			container.register('integration_model_prototype_load_test', require('./prototype/load.test'));
			describe('load', container.get('integration_model_prototype_load_test'));

			describe('unset', function () {
				it('should unset an attribute', function (done) {
					assert.equal(testData.user1.get('name'), 'John Anderson');
					testData.user1.unset('name')
						.then(function () {
							assert.isUndefined(testData.user1.get('name'));
							done();
						})
						.catch(done)
						.error(done);
				});
				it('should unset a nested attribute', function (done) {
					testData.user1.attributes.job = {
						wage: '$10'
					};
					assert.equal(testData.user1.get('job.wage'), '$10');
					testData.user1.unset('job.wage')
						.then(function () {
							assert.isUndefined(testData.user1.get('job.wage'));
							done();
						})
						.catch(done)
						.error(done);
				});
			});
			describe('set', function () {
				it('should set an attribute', function (done) {
					assert.isUndefined(testData.user1.get('job'));
					testData.user1.set('job', 'boss')
						.then(function () {
							assert.equal(testData.user1.get('job'), 'boss');
							done();
						})
						.catch(done)
						.error(done);
				});
				it('should set a nested attribute', function (done) {
					assert.isUndefined(testData.user1.get('job.wage'));
					testData.user1.set('job.wage', '$10')
						.then(function () {
							assert.equal(testData.user1.get('job.wage'), '$10');
							assert.deepEqual(testData.user1.toJSON(), {
								id: testData.user1.get(User.idAttribute),
								name: testData.user1.get('name'),
								job: {
									wage: testData.user1.get('job.wage')
								}
							});
							done();
						})
						.catch(done)
						.error(done);
				});
			});
			describe('setSync', function () {
				it('should set an attribute', function () {
					assert.isUndefined(testData.user1.get('job'));
					testData.user1.setSync('job', 'boss');
					assert.equal(testData.user1.get('job'), 'boss');
				});
				it('should set a nested attribute', function () {
					assert.isUndefined(testData.user1.get('job.wage'));
					testData.user1.setSync('job.wage', '$10');
					assert.equal(testData.user1.get('job.wage'), '$10');
					assert.deepEqual(testData.user1.toJSON(), {
						id: testData.user1.get(User.idAttribute),
						name: testData.user1.get('name'),
						job: {
							wage: testData.user1.get('job.wage')
						}
					});
				});
			});
			describe('clear', function () {
				it('should clear all attributes', function (done) {
					testData.user1.setSync('job.wage', '$10');
					assert.isDefined(testData.user1.get('job.wage'));
					assert.isDefined(testData.user1.get('name'));
					testData.user1.clear()
						.then(function () {
							assert.isUndefined(testData.user1.get('job.wage'));
							assert.isUndefined(testData.user1.get('name'));
							done();
						})
						.catch(done)
						.error(done);
				});
			});
			describe('toJSON', function () {
				it('should JSONify the attributes', function () {
					assert.deepEqual(testData.user1.toJSON(), {
						id: testData.user1.get(User.idAttribute),
						name: testData.user1.get('name')
					});
					assert.deepEqual(testData.post1.toJSON(), {
						id: testData.post1.get(Post.idAttribute),
						title: testData.post1.get('title'),
						userId: testData.user1.get(User.idAttribute)
					});
				});
			});
			describe('function', function () {
				it('should return the correct list of functions', function () {
					assert.deepEqual(testData.user1.functions(), [
						'afterCreate',
						'afterDestroy',
						'afterUpdate',
						'afterValidate',
						'beforeCreate',
						'beforeDestroy',
						'beforeUpdate',
						'beforeValidate',
						'clear',
						'clone',
						'constructor',
						'destroy',
						'escape',
						'functions',
						'get',
						'initialize',
						'isNew',
						'load',
						'save',
						'set',
						'setSync',
						'toJSON',
						'unset',
						'validate'
					]);
				});
			});
			describe('clone', function () {
				it('should clone a model instance', function () {
					var clone = testData.user1.clone();

					assert.isFalse(clone === testData.user1);
					assert.deepEqual(clone.toJSON(), testData.user1.toJSON());
				});
			});
			describe('isNew', function () {
				it('should return whether a model instance has been saved to the database', function () {
					var user = new User({ name: 'test user '});

					assert.isTrue(user.isNew());

					assert.isFalse(testData.user1.isNew());
				});
			});
		});
		describe('/static', function () {
			container.register('integration_model_static_findOne_test', require('./static/findOne.test'));
			container.register('integration_model_static_findOne_relations_test', require('./static/findOne.relations.test'));
			container.register('integration_model_static_destroyOne_test', require('./static/destroyOne.test'));

			describe('findOne', function () {
				describe('findOne.test', container.get('integration_model_static_findOne_test'));
				describe('findOne.relations.test', container.get('integration_model_static_findOne_relations_test'));
			});
			describe('destroyOne', container.get('integration_model_static_destroyOne_test'));
		});
	};
};
