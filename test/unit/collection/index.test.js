module.exports = function (container) {

	return function () {

		describe('/static', function () {
			container.register('unit_collection_static_findAll_test', require('./static/findAll.test'));

			describe('findAll', container.get('unit_collection_static_findAll_test'));
			describe('getAll', function () {
				it('no tests yet!');
			});
		});
	};
};
