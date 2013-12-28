var utils = require('../../support/utils'),
	errors = require('../../support/errors');

/**
 * @method Model#unset
 * @desc Unset a property of the instance. Supports nested keys, e.g. "address.state".
 * @instance
 * @param {string} key The property to unset.
 * @param {boolean|object} [options={}] Optional configuration.
 * @property {boolean} [options.validate=false] If true and the Model of this instance has a Schema defined,
 * ensure no schema validation errors with the new attribute(s) before setting.
 * @param {function} cb Callback function.
 * @example
 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
 *
 *  contact.unset('address.state');
 *
 *  contact.toJSON();   //  { firstName: 'John' }
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
		throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!');
	} else if (!utils.isObject(options)) {
		return cb(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object'));
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
