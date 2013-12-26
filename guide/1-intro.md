### What is reheat?

Reheat is an ORM for [RethinkDB](http://rethinkdb.com), built for the [Node.js](http://nodejs.org) platform.

#### Benefits of using reheat:
- Less code to write
- Less code to test
- Less code to maintain
- Less code that can break
- Improved sense of well-being

#### Features:
- Connection pool
- Easy Model lifecycle setup/access (`beforeUpdate()`, `afterDestroy()`, etc.)
- Robust and flexible Schema definition for your Models
- Automatic validation based on Schema
- Convert `req.query` to ReQL query (great for your app's API).
- Query builder (it's just ReQL, easy!)
- Connection and Schema can each be used on their own

#### Roadmap:
- Relationships
- Transactions (and rollbacks)
- Migrations
- You tell me!

#### Quick, what is RethinkDB?

From the RethinkDB website:

> An open-source distributed database built with love.

> Enjoy an *intuitive* query language, automatically *parallelized* queries, and *simple* administration.

> Table joins and batteries included.

RethinkDB is awesome and ReQL makes data access fun, but still, who loves writing tons of code to pull data into and out of a database? Reheat exists to eliminate boilerplate and level up your RethinkDB experience!

##### Install reheat

`npm install reheat --save`

##### Go!

<pre>
<code>
var reheat = require('reheat');

var connection = new reheat.Connection({
	db: 'local'
});

var Post = reheat.Model.extend({
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

### Resources

#### Getting Started
[Getting Started](tutorial-1-intro.html) - Read how to install reheat and get it running in your application.

#### Topics
[Topics](tutorial-2-topics.html) - List of tutorials on how to use reheat.

#### API
[API](index.html) - Reference API documentation for reheat.

#### Community
[Mailing List](https://groups.google.com/forum/#!forum/reheat) - Ask questions and get help.

[Issues](https://github.com/jmdobry/reheat/issues?state=open) - Found a bug? Feature request? Submit an issue!

[GitHub](https://github.com/jmdobry/reheat) - View the source code for reheat.

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
