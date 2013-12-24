var SandboxedModule = require('sandboxed-module'),
	Connection = SandboxedModule.require('../../../lib/connection', {
		requires: {
			'mout': require('mout'),
			'generic-pool': require('generic-pool'),
			'async': require('async'),
			'rethinkdb': require('rethinkdb')
		}
	});

describe('Connection', function () {

	describe('Connection constructor', function () {
		it('should create a new connection', function (done) {
			assert.equal(typeof Connection, 'function');
			done();
		});
	});
});
