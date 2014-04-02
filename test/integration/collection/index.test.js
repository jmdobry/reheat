module.exports = function (container) {
	return function () {

		container.register('integration_collection_prototype_tests', require('./prototype/index.test'));

		describe('/prototype', container.get('integration_collection_prototype_tests'));
		describe('/static', function () {
			container.register('integration_collection_static_filter_test', require('./static/filter.test'));
			container.register('integration_collection_static_filter_relations_test', require('./static/filter.relations.test'));
			container.register('integration_collection_static_getAll_test', require('./static/getAll.test'));
			container.register('integration_collection_static_getAll_relations_test', require('./static/getAll.relations.test'));

			describe('filter', function () {
				describe('filter.test', container.get('integration_collection_static_filter_test'));
				describe('filter.relations.test', container.get('integration_collection_static_filter_relations_test'));
			});

			describe('getAll', function () {
				describe('getAll.test', container.get('integration_collection_static_getAll_test'));
				describe('getAll.relations.test', container.get('integration_collection_static_getAll_relations_test'));
			});
		});
	};
};
