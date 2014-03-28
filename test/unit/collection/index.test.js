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
			describe('findLastIndexforEach', function () {
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
			container.register('collection_static_filter_test', require('./static/filter.test'));

			describe('filter', container.get('collection_static_filter_test'));
			describe('getAll', function () {
				it('no tests yet!');
			});
		});
	};
};
