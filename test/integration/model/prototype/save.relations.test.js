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

    it('should save a hasOne relationship', function (done) {
      var user = new User({
        name: 'test user',
        profile: new Profile({
          email: 'test.user@test.com'
        })
      });

      assert.isTrue(user.isNew());
      assert.isTrue(user.get('profile').isNew());

      user.save({ deepSave: true })
        .then(function (user) {
          assert.deepEqual(user.toJSON(), {
            id: user.get(User.idAttribute),
            name: 'test user',
            profile: {
              id: user.get('profile').get(Profile.idAttribute),
              email: 'test.user@test.com',
              userId: user.get(User.idAttribute)
            }
          });
          assert.isFalse(user.isNew());
          assert.isFalse(user.get('profile').isNew());

          done();
        })
        .catch(done)
        .error(done);
    });

    it('should save a hasMany relationship', function (done) {
      var user = new User({
        name: 'test user',
        posts: new Posts([
          {
            title: 'a'
          },
          {
            title: 'b'
          },
          {
            title: 'c'
          }
        ])
      });

      assert.isTrue(user.isNew());
      assert.isTrue(user.get('posts').hasNew());

      user.save({ deepSave: true })
        .then(function (user) {
          assert.deepEqual(user.toJSON(), {
            id: user.get(User.idAttribute),
            name: 'test user',
            posts: user.get('posts').toJSON()
          });
          assert.isFalse(user.isNew());
          assert.isFalse(user.get('posts').hasNew());

          done();
        })
        .catch(done)
        .error(done);
    });

    it('should save multiple relationships', function (done) {
      var user = new User({
        name: 'test user',
        posts: new Posts([
          {
            title: 'a',
            comments: new Comments([
              {
                content: 'wow'
              },
              {
                content: 'yes!'
              }
            ])
          },
          {
            title: 'b',
            comments: new Comments([
              {
                content: 'outstanding!'
              }
            ])
          },
          {
            title: 'c'
          }
        ]),
        profile: new Profile({
          email: 'test.user@test.com'
        })
      });

      assert.isTrue(user.isNew());
      assert.isTrue(user.get('posts').hasNew());

      user.save({ deepSave: true })
        .then(function (user) {
          assert.deepEqual(user.toJSON(), {
            id: user.get(User.idAttribute),
            name: 'test user',
            posts: user.get('posts').toJSON(),
            profile: {
              id: user.get('profile').get(Profile.idAttribute),
              email: 'test.user@test.com',
              userId: user.get(User.idAttribute)
            }
          });
          assert.isFalse(user.isNew());
          assert.isFalse(user.get('posts').hasNew());
          assert.equal(user.get('posts').models[0].get('comments').models[0].get('postId'), user.get('posts').models[0].get(Post.idAttribute));

          done();
        })
        .catch(done)
        .error(done);
    });
  };
};
