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
