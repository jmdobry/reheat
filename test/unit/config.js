var container = require('../../lib/config').container,
	path = require('path');

container.register('assert', function () {
	var chai = require('chai'),
		chaiAsPromised = require('chai-as-promised');

	chai.use(chaiAsPromised);

	return chai.assert;
});

container.register('sinon', function () {
	return require('sinon');
});

container.load(path.join(__dirname, './mocks/'));

container.register('support', require('../support/support'));

module.exports = container;
