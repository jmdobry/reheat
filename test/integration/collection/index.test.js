module.exports = function (container) {
	return function () {

		describe('/prototype', function () {
			describe('toJSON', function () {
				it('no tests yet!');
			});
			describe('functions', function () {
				it('no tests yet!');
			});
			describe('clone', function () {
				it('no tests yet!');
			});
			describe('hasNew', function () {
				it('no tests yet!');
			});
			describe('filter', function () {
				it('no tests yet!');
			});
			describe('reject', function () {
				it('no tests yet!');
			});
			describe('shuffle', function () {
				it('no tests yet!');
			});
			describe('slice', function () {
				it('no tests yet!');
			});
			describe('sort', function () {
				it('no tests yet!');
			});
			describe('sortBy', function () {
				it('no tests yet!');
			});
			describe('unique', function () {
				it('no tests yet!');
			});
			describe('every', function () {
				it('no tests yet!');
			});
			describe('find', function () {
				it('no tests yet!');
			});
			describe('findLast', function () {
				it('no tests yet!');
			});
			describe('findIndex', function () {
				it('no tests yet!');
			});
			describe('findLastIndex', function () {
				it('no tests yet!');
			});
			describe('forEach', function () {
				it('no tests yet!');
			});
			describe('invoke', function () {
				it('no tests yet!');
			});
			describe('map', function () {
				it('no tests yet!');
			});
			describe('pluck', function () {
				it('no tests yet!');
			});
			describe('reduce', function () {
				it('no tests yet!');
			});
			describe('remove', function () {
				it('no tests yet!');
			});
			describe('some', function () {
				it('no tests yet!');
			});
			describe('split', function () {
				it('no tests yet!');
			});
			describe('toLookup', function () {
				it('no tests yet!');
			});
		});
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
