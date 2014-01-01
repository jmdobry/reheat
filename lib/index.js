var errors = require('./support/errors'),
	utils = require('./support/utils');

exports.Model = require('./model');
exports.Connection = require('./connection');
exports.support = {
	UnhandledError: utils.clone(errors.UnhandledError),
	IllegalArgumentError: utils.clone(errors.IllegalArgumentError),
	ValidationError: errors.ValidationError
};

/**
 * @external robocop.Schema
 * @desc Schema class that assists in validation.
 * @see http://jmdobry.github.io/robocop.js/
 */
exports.Schema = require('robocop.js').Schema;

// Freeze the API
utils.deepFreeze(exports);
