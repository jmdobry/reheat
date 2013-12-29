var utils = require('../../support/utils'),
	errors = require('../../support/errors');

/**
 * @method Model#clear
 * @desc Clear (asynchronously) the attributes of this instance of Model.
 * @instance
 * @param {boolean|object} [options={}] Optional configuration.
 * @property {boolean} [options.validate=false] If true and the Model of this instance has a Schema defined,
 * ensure no schema validation errors with the new attribute(s) before setting.
 * @param {function} cb Callback function. Signature: <code>cb(err, instance)</code>.
 * @throws {IllegalArgumentError} Argument <code>options</code> must be an object and argument <code>cb</code> must
 * be a function.
 * @example
 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
 *
 *  contact.clear(function (err, contact) {
 *      err; // undefined
 *      contact.toJSON();   //  { }
 *  });
 *
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
