var dependable = require('dependable'),
	container = dependable.container();

container.register('r', require('rethinkdb'));
container.register('Promise', require('bluebird'));
container.register('robocop', require('robocop.js'));
container.register('mout', require('mout'));
container.register('gPool', require('generic-pool'));

container.register('models', {});
container.register('collections', {});

container.register('utils', require('./support/utils'));
container.register('extend', require('./support/extend'));
container.register('errors', require('./support/errors'));

container.register('Model', require('./model'));
container.register('Collection', require('./collection'));
container.register('Connection', require('./connection'));

container.register('container', container);

module.exports = container;
