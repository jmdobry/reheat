##### 1.0.0-beta.8 - 30 August 2014

###### Breaking API changes
- Switched out rethinkdb and generic-pool for rethinkdbdash

You should now use `Model.r` to create your custom queries instead of importing `rethinkdb`. `Model.r` is a reference to the rethinkdbdash instance of the connection of the Model.

_Before:_

```js
var r = require('rethinkdb');
var reheat = require('reheat');
var connection = new reheat.Connection();
var User = reheat.defineModel('User', {
  connection: connection,
  tableName: 'user'
});

connection.run(r.dbList()).then(function (tableList) {
  // ...
});
```

_After:_

```js
var reheat = require('reheat');
var connection = new reheat.Connection();
var User = reheat.defineModel('User', {
  connection: connection,
  tableName: 'user'
});

connection.run(User.r.dbList()).then(function (dbList) {
  // ...
});
```

The API of the `Connection` class has been reduced to only `Connection#r` and `Connection#run(query[, options][, cb)`.

The configuration options accepted by the `Connection` constructor function are now limited to the connection options accepted by `r#connect` and the rethinkdbdash constructor function.

##### 1.0.0-beta.7 - 22 June 2014

###### Backwards compatible bug fixes
- Upgraded dependencies

##### 1.0.0-beta.6 - 14 May 2014

###### Backwards compatible bug fixes
- Upgraded to rethinkdb v1.12.0-0

##### 1.0.0-beta.5 - 12 April 2014

###### Backwards compatible bug fixes
- Fixed `Collection#toJSON()` not properly calling `toJSON()` on its model instances.

##### 1.0.0-beta.4 - 12 April 2014

###### Backwards compatible bug fixes
- Fixed secondary indices not being created properly.

##### 1.0.0-beta.3 - 12 April 2014

###### Backwards compatible bug fixes
- Cleaned up use of promises to be more correct and memory safe.

##### 1.0.0-beta.2 - 06 April 2014

###### Backwards compatible bug fixes
- #42 - Querying for relations needs to handle missing "localKey"

##### 1.0.0-beta.1 - 03 April 2014
Added support for relations/associations.

###### Breaking API changes
- Renamed `Model.get` to `Model.findOne`
- Moved `Model.getAll` to `Collection.getAll`
- Moved `Model.filter` to `Collection.findAll`
- `Model.filter` (now `Collection.findAll`) now returns a collection instance instead of a plain array
- `Model.getAll` (now `Collection.getAll`) now returns a collection instance instead of a plain array

###### Backwards compatible API changes
- #4 - Add deepSave option to `Model#save()`
- #21 - Add lazy database creation
- #22 - Allow cascade deletion of child in "belongsTo" relationships
- #23 - Add "with" clause support (belongsTo, hasOne, hasMany) for `Collection.getAll()`
- #24 - Add load() method to Model prototype, for dynamically loading relationships
- #27 - Update `Model#toJson()` to handle nested relations.
- #30 - Lazy db create
- #32 - Add "with" clause support (belongsTo, hasOne, hasMany) for `Collection.findAll()`
- #38 - Create `Collection` class
- #39 - Collections and internal use of ioc container
- #40 - Feature Request: Implement - `reheat.getModel('ModelName')`
- #41 - `Collection#save()`

###### Backwards compatible bug fixes
- #28 - Connection: Uncaught Exception: undefined
- #29 - Model has a table name of 'test' if it is not explicitly set.
- #37 - Checks if relationship index exists before creating.

###### Other changes
- #3 - Finish integration tests

##### 0.10.6 - 20 March 2014

###### Backwards compatible bug fixes
- Now getting patched version of robocop

##### 0.10.5 - 19 March 2014

###### Backwards compatible bug fixes
- Updated dependencies

##### 0.10.4 - 18 March 2014

###### Backwards compatible bug fixes
- #21 - Add lazy database creation.
- Updated dependencies
