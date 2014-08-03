var r = require('rethinkdbdash')();
var assert = require('assert');

r.dbList().coerceTo('array').run()
  .then(function (dbList) {
  	assert(typeof dbList.toArray !== 'function', 'toArray should not exist, because tableList should not be a cursor');
  });
