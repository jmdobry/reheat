`Connection` is a low-level abstraction that makes it easy to manage a pool of connections to a RethinkDB database.

See the [Connection API](Connection.html) for details.

#### Default connection

<pre>
<code>
var reheat = require('reheat');

var connection = new reheat.Connection();

// RethinkDB client defaults
connection.get('db');       //  'test'
connection.get('host');     //  'localhost'
connection.get('port');     //  28015
connection.get('authKey');  //  ''

// generic-pool defaults
connection.get('max');      //  1 - Maximum pool size of 1
connection.get('min');      //  0 - Minimum pool size of 0

// More defaults are described in the Connection API
</code>
</pre>

No configuration required to connect to a RethinkDB instance running on localhost.

#### Execute a query

You can manually get a connection with which to your execute your query, or the pool can execute your query for you.

##### Manually get a connection from the pool

Remember to release the connection when you are done with it!.

<pre>
<code>
var query = r.table('post');

query = query.get('000c8359-a345-4436-82e8-4ad4290113bc');

connection.acquire(function (err, conn) {
	// check for error

	query.run(conn, function (err, post) {
		// check for error

		post.author;    //  'John Anderson'

		connection.release(conn); // release the connection back into the pool
	});
});
</code>
</pre>

##### Just let the pool execute your query

Easier to let the pool acquire and release your connections for you!

<pre>
<code>
var query = r.table('post');

query = query.get('000c8359-a345-4436-82e8-4ad4290113bc');

connection.run(query, function (err, post) {
	// check for error

	post.author;    //  'John Anderson'
});
</code>
</pre>

#### Connect to remote database

<pre>
<code>
var reheat = require('reheat');

var connection = new reheat.Connection({
	db: 'production',
	host: '254.23.41.123',
	port: 28015,
	authKey: 'secret',

	max: 20, // Tweak these to make best use of your hardware
	min: 10
});
</code>
</pre>

You can create as many instances of `Connection` as you want, though I recommend only creating one instance of `Connection` per database.

To increase performance, change the `generic-pool` settings to make the best use of your hardware.

On a Macbook Pro I peaked at ~2.3k inserts per second with 500 concurrent connections on a single thread. Each insert was a batch insert of 40 documents with several properties. I got up to ~20k inserts per second inserting individual documents.

Totally random benchmark, so you'll want to play around with these settings to see what works best for you. At least move `max` up from the default of 1.

TODO: Write a load test that developers can run on their machines and servers to test performance and optimize their connection settings. See [#1](https://github.com/jmdobry/reheat/issues/1)

See the [Connection API](Connection.html) for details.
