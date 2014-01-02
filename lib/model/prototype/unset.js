var utils = require('../../support/utils'),
	errors = require('../../support/errors');

/**
 * @doc method
 * @id Model.instance_methods:unset
 * @name unset(key[, options], cb)
 * @description
 * Unset a property of the instance. Supports nested keys, e.g. `"address.state"`.
 *
 * Example:
 *
 * ```js
 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
 *
 *  contact.unset('address.state');
 *
 *  contact.toJSON();   //  { firstName: 'John' }
 * ```
 *
 * @param {string} key The property to unset.
 * @param {boolean|object=} options Optional configuration. May be set to `true` as shorthand for
 * `{ validate: true }`. Properties:
 *
 * - `{boolean=false}` - `validate` - If `true` and the Model of this instance has a Schema defined, ensure no schema
 * validation errors occur with the new attribute(s) before unsetting, otherwise abort with the
 * validation error.
 *
 * @param {function} cb Callback function. Signature: `cb(err, instance)`. Arguments:
 *
 * - `{ValidationError|UnhandledError}` - `err` - `null` if no error occurs. `ValidationError` if a validation error
 * occurs and `UnhandledError` for any other error.
 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which
 * `unset(key[, options], cb)` was called.
 */
module.exports = function unset(key, options, cb) {
	var _this = this,
		errorPrefix = 'Model#unset(key[, options], cb): ';

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
			var clone = utils.clone(_this.attributes);
			utils.unset(clone, key);
			_this.constructor.schema.validate(clone, function (err) {

				// Handle uncaught errors
				try {
					if (err) {
						_this.validationError = new errors.ValidationError(errorPrefix + 'key: Validation failed!', err);
						return cb(_this.validationError);
					} else {
						utils.unset(_this.attributes, key);
						return cb(null, _this);
					}
				} catch (err) {
					return cb(new errors.UnhandledError(err));
				}
			});
		} else {
			utils.unset(_this.attributes, key);
			return cb(null, _this);
		}
	} catch (err) {
		return cb(new errors.UnhandledError(err));
	}
};
