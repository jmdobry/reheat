@doc overview
@id index
@name Collection Guide
@description

# Collection

<page-list></page-list>

@doc overview
@id overview
@name Overview
@description

The `Collection` "class" works much like a [Backbone.js Collection](http://backbonejs.org/#Collection), providing a useful wrapper around an array of instances of your model classes.

Any query (get, getAll, findAll) whose result contains somewhere within it an array of instances of one of your model classes will wrap that array in a collection instance. For example:

```js
Posts.findAll({ where: { userId: '12345' } })
  .then(function (posts) {
    console.log(posts instanceof Posts); // true
    posts.toJSON(); // [{...}, {...}, ..., {...}]
    posts.size(); // 23

    console.log(posts.models[0] instanceof Post); // true
  });
```

You don't need to use `reheat.defineCollection()` unless you want to add custom behavior, otherwise a collection will be defined for you for every model you define.

@doc overview
@id options
@name Defining collections
@description

[reheat.defineCollection()](/documentation/api/api/reheat.defineCollection) accepts three arguments: `name`, `staticProperties` and `prototypeProperties`.

Example:

```js
var Post = reheat.defineModel('Post', {...}, {...});

// This is optional. A default collection like this one will be
// created for you for each model you define.
var Posts = reheat.defineCollection('Posts', {
	model: Post
});

Posts.findAll({})
  .then(function (posts) {
    console.log(posts instanceof Posts); // true

    if (posts.size() > 0) {
      console.log(posts.models[0] instanceof Post); // true
    }
  });
```

### prototype properties

This is optional. Instances of your collections will work just fine without you adding anything to their prototype.
Though you probably don't need to override anything on `Collection.prototype`, you can add methods to your collections'
prototype so they'll be available to instances of your collection.

Example:

```js
var Posts = reheat.defineCollection('Posts', {...}, {
  saySomething: function () {
    console.log('hello');
  }
});

var posts = new Posts();

posts.saySomething(); // "hello"
```

### static properties

These properties configure your new collection. This argument is required because every collection needs a model assigned
to it.

Example:

```js
var Posts = reheat.defineCollection('Posts', {
	model: Post
});
```

Collections need no other static properties at this time.

See [reheat.defineCollection](/documentation/api/api/reheat.defineCollection) for more details.

@doc overview
@id instances
@name Collection instances
@description

"Instances" or "collections instances" refer to instantiations of the collections you have defined via `reheat.defineCollection()`. These
instances inherit properties from `Collection.prototype`, including any prototype properties you defined when you extended
`Collection`.

When you instantiate a collection, the constructor function accepts one argument `models`, which is an array of objects
that will be turned into instances of the collection's model or objects that are already instances of the collection's model.

Example:

```js
var posts = new Posts([
  { author: 'John Anderson' title: 'How NOT to cook' },
  { author: 'Sally Johnson', title: 'How to cook' }
]);

// posts now contains instances of Post
console.log(posts.models[0] instanceof Post); // true

posts = new Posts([
  new Post({ author: 'John Anderson' title: 'How NOT to cook' }),
  new Post({ author: 'Sally Johnson', title: 'How to cook' })
]);

// same result
console.log(posts.models[0] instanceof Post); // true
```

@doc overview
@id static
@name Static methods
@description

Collections have a few useful static methods.

### Filtering
`Collection.findAll(predicate[, options][, cb])`

Examples:
```js
Posts.findAll({
  author: 'John Anderson'
}).then(function (posts) {
  // do something with the instance of "Posts"
});

Posts.findAll({
  author: 'John Anderson'
}, {
  with: ['Comment', 'User']
}).then(function (posts) {
  // do something with the instance of "Posts"
});
```

See
See also the RethinkDB API for [filter](http://rethinkdb.com/api/javascript/#filter).

