var utils = require('../../support/utils'),
	errors = require('../../support/errors');

/**
 * @method Model#clear
 * @desc Clear the attributes of this instance of Model.
 * @instance
 * @param {boolean|object} [options={}] Optional configuration.
 * @property {boolean} [options.validate=false] If true and the Model of this instance has a Schema defined,
 * ensure no schema validation errors with the new attribute(s) before setting.
 * @param {function} cb Callback function.
 * @example
 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
 *
 *  contact.clear();
 *
 *  contact.toJSON();   //  { }
 */
module.exports = function clear(options, cb) {
	var _this = this,
		errorPrefix = 'Model#clear([options], cb): ';

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
			this.constructor.schema.validate({}, function (err) {

				// Handle uncaught errors
				try {
					if (err) {
						_this.validationError = new errors.ValidationError(errorPrefix + 'Validation failed!', err);
						cb(_this.validationError);
					} else {
						_this.attributes = {};
						cb(null)
					}
				} catch (err) {
					cb(new errors.UnhandledError(err));
				}
			});
		} else {
			this.attributes = {};
			cb(null)
		}
	} catch (err) {
		cb(new errors.UnhandledError(err));
	}
};
