var utils = require('../../support/utils'),
	errors = require('../../support/errors');

/**
 * @doc method
 * @id Model.instance_methods:clear
 * @name clear([options], cb)
 * @description
 * Clear (asynchronously) the attributes of this instance of Model.
 *
 * Example:
 *
 * ```js
 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
 *
 *  contact.clear(function (err, contact) {
 *      err; // undefined
 *      contact.toJSON();   //  { }
 *  });
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - If provided, argument `options` must be a boolean or an object.
 * - `{IllegalArgumentError}` - Argument `cb` must be a function.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {boolean|object=} options Optional configuration. Properties:
 *
 * - `{boolean=false}` - `validate` - If `true` and the Model of this instance has a Schema defined, ensure no schema
 * validation errors occur with the new attribute(s) before clearing.
 *
 * @param {function} cb Callback function. Signature: `cb(err)`. Arguments:
 *
 * - `{ValidationError|UnhandledError}` - `err` - `null` if no error occurs. `ValidationError` if a validation error occurs and
 * `UnhandledError` for any other error.
 */
module.exports = function clear(options, cb) {
	var _this = this,
		errorPrefix = 'Model#clear([options], cb): ';

	// Check pre-conditions
	options = options ? (options === true ? { validate: true } : options) : {};
	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	}
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	} else if (!utils.isObject(options)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object', { actual: typeof options, expected: 'object' }));
	}

	// Handle uncaught errors
	try {
		if (options.validate && _this.constructor.schema) {
			_this.constructor.schema.validate({}, function (err) {

				// Handle uncaught errors
				try {
					if (err) {
						_this.validationError = new errors.ValidationError(errorPrefix + 'Validation failed!', err);
						return cb(_this.validationError);
					} else {
						_this.attributes = {};
						return cb(null, _this);
					}
				} catch (err) {
					return cb(new errors.UnhandledError(err));
				}
			});
		} else {
			this.attributes = {};
			return cb(null, _this);
		}
	} catch (err) {
		return cb(new errors.UnhandledError(err));
	}
};
