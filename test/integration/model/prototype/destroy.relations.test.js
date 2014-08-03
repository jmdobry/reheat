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

    it('should deep destroy a hasOne relationship', function (done) {
      var profileId1 = testData.profile1.get(Profile.idAttribute);

      User.findOne(testData.user1.get(User.idAttribute), { with: ['Profile'] })
        .then(function (user) {
          assert.deepEqual(user.get('profile').toJSON(), testData.profile1.toJSON());
          return user.destroy({ deepDestroy: true });
        })
        .then(function (user) {
          assert.isUndefined(user.get(User.idAttribute));
          assert.isUndefined(user.get('profile').get(Profile.idAttribute));
          return User.findOne(testData.user1.get(User.idAttribute));
        })
        .then(function (user) {
          assert.isNull(user);
          return Profile.findOne(profileId1);
        })
        .then(function (profile) {
          assert.isNull(profile);
          done();
        })
        .catch(done)
        .error(done);
    });

    it('should deep destroy a hasMany relationship', function (done) {
      var postId1 = testData.post1.get(Post.idAttribute);
      var postId2 = testData.post1.get(Post.idAttribute);
      var postId5 = testData.post1.get(Post.idAttribute);

      User.findOne(testData.user1.get(User.idAttribute), { with: ['Post'] })
        .then(function (user) {
          return user.destroy({ deepDestroy: true });
        })
        .then(function (user) {
          assert.isUndefined(user.get(User.idAttribute));
          return User.findOne(testData.user1.get(User.idAttribute));
        })
        .then(function (user) {
          assert.isNull(user);
          return Posts.getAll([postId1, postId2, postId5], { index: Post.idAttribute });
        })
        .then(function (posts) {
          assert.equal(posts.size(), 0);
          return Post.findOne(postId1);
        })
        .then(function (post) {
          assert.isNull(post);
          return Post.findOne(postId2);
        })
        .then(function (post) {
          assert.isNull(post);
          return Post.findOne(postId5);
        })
        .then(function (post) {
          assert.isNull(post);
          done();
        })
        .catch(done)
        .error(done);
    });

    it('should deep destroy multiple relationships', function (done) {
      var profileId = testData.profile1.get(Profile.idAttribute),
        postId1 = testData.post1.get(Post.idAttribute),
        postId2 = testData.post1.get(Post.idAttribute),
        postId5 = testData.post1.get(Post.idAttribute),
        commentId1 = testData.comment1.get(Comment.idAttribute),
        commentId2 = testData.comment2.get(Comment.idAttribute),
        commentId3 = testData.comment3.get(Comment.idAttribute),
        commentId4 = testData.comment4.get(Comment.idAttribute),
        commentId5 = testData.comment5.get(Comment.idAttribute);

      User.findOne(testData.user1.get(User.idAttribute), { with: ['Profile', 'Post', 'Comment'] })
        .then(function (user) {
          return user.destroy({ deepDestroy: true });
        })
        .then(function (user) {
          assert.isUndefined(user.get(User.idAttribute));
          return User.findOne(testData.user1.get(User.idAttribute));
        })
        .then(function (user) {
          assert.isNull(user);
          return Profile.findOne(profileId);
        })
        .then(function (profile) {
          assert.isNull(profile);
          return Posts.getAll([postId1, postId2, postId5], { index: Post.idAttribute });
        })
        .then(function (posts) {
          assert.equal(posts.size(), 0);
          return Post.findOne(postId1);
        })
        .then(function (post) {
          assert.isNull(post);
          return Post.findOne(postId2);
        })
        .then(function (post) {
          assert.isNull(post);
          return Post.findOne(postId5);
        })
        .then(function (post) {
          assert.isNull(post);
          return Comments.getAll([commentId1, commentId2, commentId3, commentId4, commentId5], { index: Comment.idAttribute });
        })
        .then(function (comments) {
          assert.equal(comments.size(), 0);
          return Comment.findOne(commentId1);
        })
        .then(function (comment) {
          assert.isNull(comment);
          return Comment.findOne(commentId2);
        })
        .then(function (comment) {
          assert.isNull(comment);
          return Comment.findOne(commentId3);
        })
        .then(function (comment) {
          assert.isNull(comment);
          return Comment.findOne(commentId4);
        })
        .then(function (comment) {
          assert.isNull(comment);
          return Comment.findOne(commentId5);
        })
        .then(function (comment) {
          assert.isNull(comment);
          done();
        })
        .catch(done)
        .error(done);
    });
  };
};
