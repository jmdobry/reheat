var config = require('./config');

describe('/unit', function () {

	config.register('unit_collection_tests', require('./collection/index.test'));
	config.register('unit_model_tests', require('./model/index.test'));
	config.register('unit_connection_tests', require('./connection/index.test'));

	describe('/collection', config.get('unit_collection_tests'));
	describe('/model', config.get('unit_model_tests'));
	describe('/connection', config.get('unit_connection_tests'));
});
