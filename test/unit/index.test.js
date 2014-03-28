var config = require('./config');

module.exports = function () {

	describe('/collection', function () {

		describe('/prototype', function () {
			describe('toJSON', function () {
				it('no tests yet!');
			});
		});
		describe('/static', function () {
			config.register('collection_static_filter_test', require('./collection/static/filter.test'));

			describe('filter', config.get('collection_static_filter_test'));
			describe('getAll', function () {
				it('no tests yet!');
			});
		});
	});
};
