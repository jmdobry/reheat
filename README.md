## reheat

__Current Version:__ 0.10.2

__A red hot Node.js ORM for RethinkDB.__

#### This is alpha software! API will fluctuate until 1.0.0.

All documentation can be found at [http://reheat.codetrain.io/](http://reheat.codetrain.io/).

<a href="https://nodei.co/npm/reheat/">
    <img src="https://nodei.co/npm/reheat.png?downloads=true">
</a>

## What is reheat?

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

```javascript
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
```

## Resources

#### Getting Started
[Getting Started](http://reheat.codetrain.io/documentation/guide/overview/index) - Read how to install reheat and get it running in your application.

#### Guide
[Guide](http://reheat.codetrain.io/documentation/guide/index) - List of tutorials on how to use reheat.

#### API
[API](http://reheat.codetrain.io/documentation/api/api/index) - Reference API documentation for reheat.

#### Community
[Mailing List](https://groups.google.com/forum/?fromgroups#!forum/reheat) - Ask questions and get help.

[Issues](https://github.com/jmdobry/reheat/issues?state=open) - Found a bug? Feature request? Submit an issue!

[GitHub](https://github.com/jmdobry/reheat) - View the source code for reheat.

## Project Status

| Branch | Master |
| ------ | ------ |
| Version | [![NPM version](https://badge.fury.io/js/reheat.png)](http://badge.fury.io/js/reheat) |
| Source | [master](https://github.com/jmdobry/reheat) |
| Build Status | [![Build Status](https://travis-ci.org/jmdobry/reheat.png?branch=master)](https://travis-ci.org/jmdobry/reheat) |
| Code Climate | [![Code Climate](https://codeclimate.com/github/jmdobry/reheat.png)](https://codeclimate.com/github/jmdobry/reheat) |
| Dependency Status | [![Dependency Status](https://gemnasium.com/jmdobry/reheat.png)](https://gemnasium.com/jmdobry/reheat) |
| Coverage | [![Coverage Status](https://coveralls.io/repos/jmdobry/reheat/badge.png?branch=feature-promises)](https://coveralls.io/r/jmdobry/reheat?branch=feature-promises) |

## License
[MIT License](https://github.com/jmdobry/reheat/blob/master/LICENSE)

Copyright (C) 2013-2014 Jason Dobry

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
