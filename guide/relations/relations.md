@doc overview
@id index
@name Relations Guide
@description

# Relations

<page-list></page-list>

@doc overview
@id overview
@name Overview
@description

Currently Reheat supports querying Models and one-level deep relations. You can define `belongsTo`, `hasOne` and `hasMany` relationships.

Reheat will create the necessary secondary indices for you if they don't already exist. Let's get to the examples:

```js
var User = reheat.defineModel('User', {
  tableName: 'user',
  connection: connection,
  relations: {
    hasMany: {
      Post: {
        localField: 'posts',
        foreignKey: 'userId'
      },
      Comment: {
        localField: 'comments',
        foreignKey: 'userId'
      }
    },
    hasOne: {
      Profile: {
        localField: 'profile',
        foreignKey: 'userId'
      }
    }
  }
});

var Profile = reheat.defineModel('Profile', {
  tableName: 'profile',
  connection: connection,
  relations: {
    belongsTo: {
      User: {
        localKey: 'userId',
        localField: 'user'
      }
    }
  }
});

var Post = reheat.defineModel('Post', {
  tableName: 'post',
  connection: connection,
  relations: {
    belongsTo: {
      User: {
        localKey: 'userId',
        localField: 'user'
      }
    },
    hasMany: {
      Comment: {
        localField: 'comments',
        foreignKey: 'postId'
      }
    }
  }
});

var Comment = reheat.defineModel('Comment', {
  tableName: 'comment',
  connection: connection,
  relations: {
    belongsTo: {
      User: {
        localKey: 'userId',
        localField: 'user'
      },
      Post: {
        localKey: 'postId',
        localField: 'post'
      }
    }
  }
});
```

`localField` refers to attribute on the model instance where the relation will go. For example:

```js
User.get('1234', { with: ['Post'] }).then(function (user) {

  User.relations.hasMany.Post.localField; // "posts"

  // therefore
  console.log(user.get('posts') instanceof Post.collection); // true
});
```

`foreignKey` refers to the field on which the secondary index should be created in the relation's table. (Used with `hasOne` and `hasMany` relations.)

`localKey` refers to the field on which the secondary index should be created in the model's table. (Used with `belongsTo` relations.)

Examples:
```js
var Post = reheat.defineModel('Post', {
  tableName: 'post',
  connection: connection,
  relations: {
    belongsTo: {
      User: {
        localKey: 'userId', // secondary index on "userId" in the "post" table
        localField: 'user'
      }
    },
    hasMany: {
      Comment: {
        localField: 'comments',
        foreignKey: 'postId' // secondary index on "postId" in the "comment" table
      }
    }
  }
});
```

@doc overview
@id options
@name Querying Relations
@description

Methods that support quering relations:

- [Model#get(primaryKey[ options][, cb])](http://reheat/documentation/api/api/Model.static_methods:get)
- [Collection#findAll(predicate[, options][, cb])](http://reheat/documentation/api/api/Collection.static_methods:findAll)
- [Collection#getAll(keys, index[, options][, cb])](http://reheat/documentation/api/api/Collection.static_methods:getAll)

Examples:

```js
User.get('1234', { with: ['Profile'] }).then(function (user) {
  user.get('profile');
});

Posts.findAll({ author: 'John Anderson' }, { with: ['Comment'] }).then(function (posts) {
  posts.forEach(function (post) {
    post.get('comments');
  });
});

Users.getAll(['12345', '67890'], { with: ['Profile', 'Post', 'Comment'] }).then(function (users) {
  users.forEach(function (user) {
    user.get('profile');
    user.get('posts');
    user.get('comments');
  });
});
```

See the tests for more examples:

- [findOne.relations.test.js](https://github.com/jmdobry/reheat/blob/master/test/integration/model/static/findOne.relations.test.js)
- [findAll.relations.test.js](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/static/findAll.relations.test.js)
- [getAll.relations.test.js](https://github.com/jmdobry/reheat/blob/master/test/integration/collection/static/getAll.relations.test.js)

@doc overview
@id instances
@name Saving/Destroy Relations
@description

When you call `Model#save` or `Model#destroy` you can pass an option (`deepSave` or `deepDestroy`) which cause `save` or `destroy` to be called
on any hasOne or hasMany relations loaded into model instance.

```js
var profileId;

User.get('12345', { with: ['Profile'] })
  .then(function (user) {
    profileId = user.get('profile').get('id');
    return user.destroy({ deepDestroy: true });
  })
  .then(function () {
    return User.get('12345');
  })
  .then(function (user) {
    user; // null

    return Profile.get(profileId);
  })
  .then(function (profile) {
    profile; // null
  });
```

`Model.destroyOne`, a static method, is a more efficient way to destroy a single row, along with any hasOne or hasMany relations.

```js
Model.destroyOne('12345', { with: ['Profile'] })
  .then(function (result) {
    result.deleted; // 1
    return User.get('12345');
  })
  .then(function (user) {
    user; // null

    return Profile.get(profileId);
  })
  .then(function (profile) {
    profile; // null
  });
```
