var utils = require('../../support/utils'),
	errors = require('../../support/errors');

/**
 * @doc method
 * @id Model.instance_methods:set
 * @name set(key[, value][,options], cb)
 * @description
 * Set (asynchronously) the given values on this instance.
 *
 * Example:
 *
 * ```js
 *  var contact = new Contact({
 *      address: {
 *          city: 'New York'
 *      }
 *  });
 *
 *  contact.set({
 *      firstName: 'John',
 *      lastName: 5
 *  }, { validate: true }, function (err, contact) {
 *      err; // { lastName: { errors: ['type'] } }
 *
 *      contact.set('email', 'john.anderson@gmail.com', function (err, contact) {
 *          contact.get('email');   //  'john.anderson@gmail.com'
 *
 *          contact.set({ lastName:  'Anderson' }, function (err, contact) {
 *              contact.get('lastName');   //  'Anderson'
 *
 *              contact.toJSON();   //  {
 *                                  //      email: 'john.anderson@gmail.com',
 *                                  //      lastName: 'Anderson'
 *                                  //      address: {
 *                                  //          city: 'New York'
 *                                  //      }
 *                                  //  }
 *          });
 *      });
 *  });
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `cb` must be a function.
 * - `{IllegalArgumentError}` - Argument `predicate` must be an object.
 * - `{IllegalArgumentError}` - If provided, argument `options` must be a boolean or an object.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string|object} key If a string, the key to be set to `value`. Supports nested keys, e.g. `"address.state"`.
 * If an object, the object will be merged into this instance's attributes.
 * @param {*} [value] The value to set. Used only if `key` is a string.
 * @param {boolean|object=} options Optional configuration. May be set to `true` as shorthand for
 * `{ validate: true }`. Properties:
 *
 * - `{boolean=false}` - `validate` - If `true` and the Model of this instance has a Schema defined, ensure no schema
 * validation errors occur with the new attribute(s) before setting, otherwise abort with the
 * validation error.
 *
 * @param {function} cb Callback function. Signature: `cb(err, instance)`. Arguments:
 *
 * - `{ValidationError|UnhandledError}` - `err` - `null` if no error occurs. `ValidationError` if a validation error
 * occurs and `UnhandledError` for any other error.
 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which
 * `set(key[, value][, options], cb)` was called.
 */
module.exports = function set(key, value, options, cb) {
	var _this = this,
		errorPrefix = 'Model#set(key[, value][, options], cb): ';

	// Check pre-conditions
	if (utils.isFunction(value)) {
		cb = value;
		options = {};
	} else if (utils.isFunction(options)) {
		cb = options;
		if (utils.isObject(key)) {
			options = value;
		} else {
			options = {};
		}
	}
	options = options ? (options === true ? { validate: true } : options) : {};
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	} else if (!utils.isObject(options)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object', { actual: typeof options, expected: 'object' }));
	} else if (!utils.isObject(key) && !utils.isString(key)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'key: Must be a string or an object!', { actual: typeof key, expected: 'string|object' }));
	}

	// Handle uncaught errors
	try {
		// TODO: Keep track of changes
		if (options.validate && _this.constructor.schema) {
			var clone = utils.clone(_this.attributes);
			if (utils.isObject(key)) {
				utils.deepMixIn(clone, key);
			} else {
				utils.set(clone, key, value);
			}
			_this.constructor.schema.validate(clone, function (err) {

				// Handle uncaught errors
				try {
					if (err) {
						_this.validationError = new errors.ValidationError(errorPrefix + 'key/value: Validation failed!', err);
						return cb(_this.validationError);
					} else {
						if (utils.isObject(key)) {
							utils.deepMixIn(_this.attributes, key);
						} else {
							utils.set(_this.attributes, key, value);
						}
						return cb(null, _this);
					}
				} catch (err) {
					return cb(new errors.UnhandledError(err));
				}
			});
		} else {
			if (utils.isObject(key)) {
				utils.deepMixIn(_this.attributes, key);
			} else {
				utils.set(_this.attributes, key, value);
			}
			return cb(null, _this);
		}
	} catch (err) {
		return cb(new errors.UnhandledError(err));
	}
};
