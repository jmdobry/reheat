### What is reheat?

Reheat is an ORM for [RethinkDB](http://rethinkdb.com), built for the [Node.js](http://nodejs.org) platform.

#### Quick, what is RethinkDB?

From the RethinkDB website:

> An open-source distributed database built with love.

> Enjoy an *intuitive* query language, automatically *parallelized* queries, and *simple* administration.

> Table joins and batteries included.

RethinkDB is awesome and ReQL makes data access fun, but still, who loves writing tons of code to pull data into and out of a database? Reheat exists to eliminate boilerplate and level up your RethinkDB experience!

<pre>
<code>
var Post = Model.extend({
	beforeCreate: function (cb) {
		this.set('tags', []);
		cb();
	}
}, {
	tableName: 'post'
});

var post = new Post({
	author: 'Jason Dobry',
	title: 'How to reheat your app'
});

post.isNew(); // true

post.save(function (err, post) {
	post.toJSON();  //  {
					//      id: '1c83229b-1628-4098-a618-abc05af1ebdb',
					//      author: 'Jason Dobry',
					//      title: 'How to reheat your app',
					//      tags: []
					//  }

	post.isNew();   //  false
});
</code>
</pre>

### Project Status

<table class="table">
<thead>
<tr>
<th></th>
<th>Master</th>
</tr>
</thead>
<tbody>
<tr>
<td>Version</td>
<td>[0.0.1-SNAPSHOT](https://github.com/jmdobry/reheat)</td>
</tr>
<tr>
<td>Source</td>
<td>[master](https://github.com/jmdobry/reheat)</td>
</tr>
<tr>
<td>Build Status</td>
<td>[![Build Status](https://travis-ci.org/jmdobry/reheat.png?branch=master)](https://travis-ci.org/jmdobry/reheat)</td>
</tr>
<tr>
<td>Coverage</td>
<td>[![Coverage Status](https://coveralls.io/repos/jmdobry/reheat/badge.png?branch=master)](https://coveralls.io/r/jmdobry/reheat?branch=master)</td>
</tr>
<tr>
<td>Code Climate</td>
<td>[![Code Climate](https://codeclimate.com/github/jmdobry/reheat.png)](https://codeclimate.com/github/jmdobry/reheat)</td>
</tr>
<tr>
<td>Dependency Status</td>
<td>[![Dependency Status](https://gemnasium.com/jmdobry/reheat.png)](https://gemnasium.com/jmdobry/reheat)</td>
</tr>
</tbody>
</table>

### Getting Started

#### Installation
[Installation](installation.html) - Read how to install reheat and get it running in your application.

#### Guide
[Guide](guide.html) - Learn how to use reheat and read about common usage patterns.

#### API
[API](api.html) - Reference API documentation for reheat.

#### Community
[Mailing List](https://groups.google.com/forum/#!forum/reheat) - Ask questions and get help.

[Issues](https://github.com/jmdobry/reheat/issues?state=open) - Found a bug? Feature request? Submit an issue!

[GitHub](https://github.com/jmdobry/reheat) - View the source code for reheat.
