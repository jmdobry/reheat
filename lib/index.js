var errors = require('./support/errors'),
	utils = require('./support/utils');

var reheat = {
	Model: require('./model'),
	Connection: require('./connection'),
	support: {
		UnhandledError: errors.UnhandledError,
		IllegalArgumentError: errors.IllegalArgumentError,
		ValidationError: errors.ValidationError
	}
};

utils.deepMixIn(reheat, require('robocop.js'));

// Freeze the API
utils.deepFreeze(reheat);

module.exports = reheat;
