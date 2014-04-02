module.exports = function (container) {
	return function () {

		describe('/prototype', function () {
			container.register('integration_model_prototype_save_test', require('./prototype/save.test'));
			container.register('integration_model_prototype_destroy_test', require('./prototype/destroy.test'));

			describe('save', container.get('integration_model_prototype_save_test'));
			describe('destroy', container.get('integration_model_prototype_destroy_test'));
			describe('unset', function () {
				it('no tests yet!');
			});
			describe('set', function () {
				it('no tests yet!');
			});
			describe('setSync', function () {
				it('no tests yet!');
			});
			describe('clear', function () {
				it('no tests yet!');
			});
			describe('toJSON', function () {
				it('no tests yet!');
			});
			describe('functions', function () {
				it('no tests yet!');
			});
			describe('clone', function () {
				it('no tests yet!');
			});
			describe('isNew', function () {
				it('no tests yet!');
			});
		});
		describe('/static', function () {
			container.register('integration_model_static_get_test', require('./static/get.test'));
			container.register('integration_model_static_get_relations_test', require('./static/get.relations.test'));

			describe('get', function () {
				describe('get.test', container.get('integration_model_static_get_test'));
				describe('get.relations.test', container.get('integration_model_static_get_relations_test'));
			});
		});
	};
};
