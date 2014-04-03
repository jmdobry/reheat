module.exports = function (container, assert) {
	return function () {
		it('exists', function () {
			assert.isTrue(true);
		});
	};
};
