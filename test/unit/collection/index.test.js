module.exports = function (container) {

	return function () {

		describe('/static', function () {
			container.register('unit_collection_static_filter_test', require('./static/filter.test'));

			describe('filter', container.get('unit_collection_static_filter_test'));
			describe('getAll', function () {
				it('no tests yet!');
			});
		});
	};
};
