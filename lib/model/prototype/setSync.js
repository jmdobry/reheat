var utils = require('../../support/utils'),
	errors = require('../../support/errors');

/**
 * @method Model#setSync
 * @desc Set (synchronously) the given values on this instance.
 * @instance
 * @param {string|object} key If a string, the key to be set to <code>value</code>. Supports nested keys, e.g. <code>
 * "address.state"</code>. If an object, the object will be merged into this instance's attributes.
 * @param {*} [value] The value to set. Used only if <code>key</code> is a string.
 * @param {boolean|object} [options={}] Optional configuration. May be set to <code>true</code> as shorthand for
 * <code>{ validate: true }</code>.
 * @property {boolean} [options.validate=false] If <code>true</code> and the Model of this instance has a Schema
 * defined, ensure no schema validation errors with the new attribute(s) before setting, otherwise abort with the
 * validation error.
 * @throws {IllegalArgumentError} Argument <code>key</code> must be a string or an object and argument <code>options
 * </code> must be a boolean or an object.
 * @throws {ValidationError} Thrown if <code>options === true</code> or <code>options.validate === true</code> and
 * validation fails.
 * @example
 *  var contact = new Contact({
 *      address: {
 *          city: 'New York'
 *      }
 *  });
 *
 *  try {
 *      contact.setSync({
 *          firstName: 'John',
 *          lastName: 5
 *      }, { validate: true );
 *  } catch (err) {
 *      if (err instance of reheat.ValidationError) {
 *          console.log(err.errors); { lastName: { errors: ['type'] } }
 *      }
 *  }
 *
 *  contact.setSync('email', 'john.anderson@gmail.com');
 *
 *  contact.setSync({ lastName: 'Anderson' });
 *
 *  contact.toJSON();   //  {
 *                      //      email: 'john.anderson@gmail.com',
 *                      //      lastName: 'Anderson',
 *                      //      address: {
 *                      //          city: 'New York'
 *                      //      }
 *                      //  }
 */
module.exports = function setSync(key, value, options) {
	var errorPrefix = 'Model#setSync(key[, value][, options]): ';

	// Check pre-conditions
	if (utils.isObject(key) && !options) {
		options = value;
	}
	options = options ? (options === true ? { validate: true } : options) : {};
	if (!utils.isObject(options)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
	} else if (!utils.isObject(key) && !utils.isString(key)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'key: Must be a string or an object!', { actual: typeof key, expected: 'string|object' });
	}

	// Handle uncaught errors
	try {
		// TODO: Keep track of changes
		if (options.validate && this.constructor.schema) {
			var clone = utils.clone(this.attributes);
			if (utils.isObject(key)) {
				utils.deepMixIn(clone, key);
			} else {
				utils.set(clone, key, value);
			}
			var err = this.constructor.schema.validateSync(clone);

			if (err) {
				this.validationError = new errors.ValidationError(errorPrefix + 'key/value: Validation failed!', err);
				throw this.validationError;
			} else {
				if (utils.isObject(key)) {
					utils.deepMixIn(this.attributes, key);
				} else {
					utils.set(this.attributes, key, value);
				}
			}
		} else {
			if (utils.isObject(key)) {
				utils.deepMixIn(this.attributes, key);
			} else {
				utils.set(this.attributes, key, value);
			}
		}
	} catch (err) {
		if (err instanceof errors.ValidationError) {
			throw err;
		} else {
			throw new errors.UnhandledError(err);
		}
	}
};
