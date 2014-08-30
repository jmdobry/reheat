@doc overview
@id index
@name Connection Guide
@description

# Connection

<page-list></page-list>

@doc overview
@id overview
@name Overview
@description

Reheat uses the [`Connection`](/documentation/api/api/Connection) class to connect to instances of RethinkDB.

Each instance of `Connection` manages a pool of connections to an instance of RethinkDB. The default configuration options
are sufficient for connecting to a default RethinkDB instance on `localhost`. Every `Model` you define needs an
instance of `Connection` in order to operate.

<page-list></page-list>

```js
var reheat = require('reheat');
var Connection = reheat.Connection;

// Connect to a default RethinkDB instance
var connection = new Connection();

connection.run(connection.r.tableList(), function (err, tableList) {
  // A default RethinkDB instance has one db ('test') with no tables
  tableList;  //  [ ]
});
```

@doc overview
@id options
@name Configuration Options
@description

The `Connection` constructor function and [rethinkdbdash](https://github.com/neumino/rethinkdbdash).

All options:
```js
var reheat = require('reheat');
var Connection = reheat.Connection;

// Example of all options
var connection = new Connection({
  // RethinkDB options
  port: 28015,
  host: '123.45.67.890',
  db: 'prod',
  authKey: 'mySecret',

  // pool options
  min: 50,
  max: 1000,
  bufferSize: 50,
  timeoutError: 1000,
  timeoutGb: 60 * 60 * 1000,
  maxExponent: 6,
  silent: false
});
```
