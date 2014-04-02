var assert = require('chai').assert;

module.exports = function () {
	var reheat;

	beforeEach(function () {
		reheat = require('../../../../lib');
	});
	it('exists', function () {
		assert.isTrue(true);
	});
};
