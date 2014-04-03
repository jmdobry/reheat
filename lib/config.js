var dependable = require('dependable'),
	container = dependable.container();

module.exports = {
	container: container,
	reset: function () {
		// 3rd-party dependencies
		container.register('r', function () {
			return require('rethinkdb');
		});
		container.register('Promise', function () {
			return require('bluebird');
		});
		container.register('robocop', function () {
			return require('robocop.js');
		});
		container.register('mout', function () {
			return require('mout');
		});
		container.register('gPool', function () {
			return require('generic-pool');
		});

		// Utilities, do not need to be mocked
		container.register('utils', require('./support/utils'));
		container.register('extend', require('./support/extend'));
		container.register('errors', require('./support/errors'));

		// Global state variables
		container.register('models', {});
		container.register('collections', {});

		// Model prototype
		container.register('Model_set', require('./model/prototype/set'));
		container.register('Model_setSync', require('./model/prototype/setSync'));
		container.register('Model_unset', require('./model/prototype/unset'));
		container.register('Model_clear', require('./model/prototype/clear'));
		container.register('Model_save', require('./model/prototype/save'));
		container.register('Model_destroy', require('./model/prototype/destroy'));
		container.register('Model_prototype', require('./model/prototype'));

		// Model static
		container.register('Model_findOne', require('./model/static/findOne'));
		container.register('Model_destroyOne', require('./model/static/destroyOne'));

		// Model
		container.register('Model', require('./model'));

		// Collection prototype
		container.register('Collection_save', require('./collection/prototype/save'));
		container.register('Collection_prototype', require('./collection/prototype'));

		// Collection static
		container.register('Collection_findAll', require('./collection/static/findAll'));
		container.register('Collection_getAll', require('./collection/static/getAll'));

		// Collection
		container.register('Collection', require('./collection'));

		// Connection
		container.register('Connection', require('./connection'));

		// Make the container injectable
		container.register('container', container);
	}
};

module.exports.reset();
