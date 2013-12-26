//var Connection = require('../../../build/instrument/lib/connection');

var SandboxedModule = require('sandboxed-module'),
	Connection = SandboxedModule.require('../../../build/instrument/lib/connection', {
		requires: {
			'mout': require('mout'), // Real dependency
			'generic-pool': require('generic-pool'), // Real dependency
			'r': {
				connect: function (options, cb) {
					cb({
						close: function () {}
					});
				}
			}, // Mock dependency
			async: require('async') // Real dependency
		}
	});

exports.defaults = function(test) {
	test.expect(4);

	var connection = new Connection();

	test.equal(connection.get('db'), 'test', 'Should have the default db');
	test.equal(connection.get('host'), 'localhost', 'Should have the default host');
	test.equal(connection.get('port'), 28015, 'Should have the default port');
	test.equal(connection.get('authKey'), '', 'Should have the default authKey');

	test.done();
};

exports.configure = function(test) {
	test.expect(5);

	var connection = new Connection();

	test.equal(connection.get('db'), 'test', 'Should have the default db');
	test.equal(connection.get('host'), 'localhost', 'Should have the default host');
	test.equal(connection.get('port'), 28015, 'Should have the default port');
	test.equal(connection.get('authKey'), '', 'Should have the default authKey');

	connection.configure({
		db: 'different'
	});

	test.equal(connection.get('db'), 'different', 'Should have a different db');

	test.done();
};
