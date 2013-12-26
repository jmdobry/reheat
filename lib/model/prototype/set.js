var utils = require('../../support/utils'),
	errors = require('../../support/errors');

/**
 * @method Model#set
 * @desc
 * @instance
 * @param {string|object} key If a string, the key of the value to set. Supports nested keys, e.g. "address.state".
 * If an object, the object will be merged into the instance's attributes.
 * @param {*} value The value to set.
 * @param {boolean|object} [options={}] Optional configuration.
 * @property {boolean} [options.validate=false] If true and the Model of this instance has a Schema defined,
 * ensure no schema validation errors with the new attribute(s) before setting, otherwise abort with any validation
 * errors.
 * @param {function} cb Callback function.
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
 *  });
 *
 *  contact.set('email', 'john.anderson@gmail.com', function (err, contact) {
 *      contact.get('email');   //  'john.anderson@gmail.com'
 *  });
 *
 *  contact.setSync('address.state', 'NY'); // Asynchronous validation rules will be skipped
 *
 *  contact.setSync('address.state', 5); // { address: { state: { errors: ['type'] } } }
 *
 *  contact.toJSON();   //  {
 *                      //      firstName: 'John',
 *                      //      lastName: 'Anderson',
 *                      //      email: 'john.anderson@gmail.com',
 *                      //      address: {
 *                      //          state: 'NY'
 *                      //      }
 *                      //  }
 */
module.exports = function set(key, value, options, cb) {
	var _this = this,
		errorPrefix = 'Model#set(key, value[, options], cb): ';

	// Check pre-conditions
	options = options ? (options === true ? { validate: true } : options) : {};
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!');
	} else if (!utils.isObject(options)) {
		cb(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object'));
	}

	// Handle uncaught errors
	try {
		if (options.validate && this.constructor.schema) {
			var clone = utils.clone(this.attributes);
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
						cb(null)
					}
				} catch (err) {
					cb(new errors.UnhandledError(err));
				}
			});
		} else {
			if (utils.isObject(key)) {
				utils.deepMixIn(this.attributes, key);
			} else {
				utils.set(this.attributes, key, value);
			}
			cb(null, this);
		}
	} catch (err) {
		cb(new errors.UnhandledError(err));
	}
};
