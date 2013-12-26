var errors = require('./support/errors');

exports.Model = require('./model');
exports.Connection = require('./connection');
exports.UnhandledError = errors.UnhandledError;
exports.IllegalArgumentError = errors.IllegalArgumentError;
exports.ValidationError = errors.ValidationError;

/**
 * Schema class that assists in validation.
 * @external robocop.Schema
 * @see {@link http://jmdobry.github.io/robocop.js/}
 */
exports.Schema = require('robocop.js').Schema;
