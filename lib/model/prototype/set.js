var utils = require('../../support/utils'),
	errors = require('../../support/errors');

/**
 * @method Model#set
 * @desc Set the given values on this instance.
 * @instance
 * @param {string|object} key If a string, the key to be set to <code>value</code>. Supports nested keys, e.g. <code>
 * "address.state"</code>. If an object, the object will be merged into this instance's attributes.
 * @param {*} [value] The value to set. Used only if <code>key</code> is a string.
 * @param {boolean|object} [options={}] Optional configuration. May be set to <code>true</code> as shorthand for
 * <code>{ validate: true }</code>.
 * @property {boolean} [options.validate=false] If <code>true</code> and the Model of this instance has a Schema
 * defined, ensure no schema validation errors with the new attribute(s) before setting, otherwise abort with the
 * validation error.
 * @param {function} cb Callback function. Signature: <code>cb(err, instance)</code>.
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
 *                                  //      lastName: 'Anderson
 *                                  //      address: {
 *                                  //          city: 'New York'
 *                                  //      }
 *                                  //  }
 *          });
 *      });
 *  });
 */
module.exports = function set(key, value, options, cb) {
	var _this = this,
		errorPrefix = 'Model#set(key[, value][, options], cb): ';

	// Check pre-conditions
	options = options ? (options === true ? { validate: true } : options) : {};
	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	}
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!');
	} else if (!utils.isObject(options)) {
		cb(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object'));
	} else if (!utils.isObject && !utils.isString(key)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'key: Must be a string or an object!');
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
			this.constructor.schema.validate(clone, function (err) {

				// Handle uncaught errors
				try {
					if (err) {
						_this.validationError = new errors.ValidationError(errorPrefix + 'key/value: Validation failed!', err);
						cb(_this.validationError);
					} else {
						utils.unset(_this.attributes, key);
						cb(null, _this);
					}
				} catch (err) {
					cb(new errors.UnhandledError(err));
				}
			});
		} else {
			if (utils.isObject(key)) {
				utils.deepMixIn(_this.attributes, key);
			} else {
				utils.set(_this.attributes, key, value);
			}
			cb(null, _this);
		}
	} catch (err) {
		cb(new errors.UnhandledError(err));
	}
};
