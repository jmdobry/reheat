var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	IllegalArgumentError = errors.IllegalArgumentError,
	Promise = require('bluebird'),
	errorPrefix = 'Model#unset(key[, options][, cb]): ';

/**
 * @doc method
 * @id Model.instance_methods:unset
 * @name unset
 * @description
 * Unset a property of the instance. Supports nested keys, e.g. `"address.state"`.
 *
 * ## Signature:
 * ```js
 * Model#unset(key[, options][, cb])
 * ```
 *
 * ## Examples:
 *
 * ### Promise-style:
 * ```js
 *  // contact.constructor.schema defines contact.firstName as nullable:false
 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
 *
 *  contact.unset('firstName', { validate: true }).then(function (contact) {
 *      // do something with contact
 *  })
 *  catch(reheat.support.ValidationError, function (err) {
 *      // handle validation error
 *  });
 * ```
 *
 * ### Node-style:
 * ```js
 *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
 *
 *  contact.unset('address.state', function (err, contact) {
 *      contact.toJSON();   //  { firstName: 'John' }
 *  });
 * ```
 *
 * ## Throws/Rejects with
 *
 * - `{IllegalArgumentError}`
 * - `{UnhandledError}`
 *
 * @param {string} key The property to unset.
 * @param {boolean|object=} options Optional configuration. May be set to `true` as shorthand for
 * `{ validate: true }`. Properties:
 *
 * - `{boolean=false}` - `validate` - If `true` and the Model of this instance has a Schema defined, ensure no schema
 * validation errors occur with the new attribute(s) before unsetting, otherwise abort with the
 * validation error.
 *
 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
 *
 * - `{ValidationError|UnhandledError}` - `err` - `null` if no error occurs. `ValidationError` if a validation error
 * occurs and `UnhandledError` for any other error.
 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which
 * `unset(key[, options][, cb])` was called.
 * @returns {Promise} Promise.
 */
module.exports = function unset(key, options, cb) {
	var _this = this;

	// Check pre-conditions
	options = options ? (options === true ? { validate: true } : options) : {};
	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	}
	if (cb && !utils.isFunction(cb)) {
		throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	}

	return Promise.resolve().then(function santizie() {
		if (!utils.isObject(options)) {
			throw new IllegalArgumentError(errorPrefix + 'options: Must be an object', { actual: typeof options, expected: 'object' });
		}

		if (options.validate && _this.constructor.schema) {
			var clone = utils.clone(_this.attributes),
				deferred = Promise.defer();

			utils.unset(clone, key);
			_this.constructor.schema.validate(clone, function (err) {
				if (err) {
					_this.validationError = new errors.ValidationError(errorPrefix + 'key: Validation failed!', err);
					throw _this.validationError;
				} else {
					utils.unset(_this.attributes, key);
					deferred.resolve(_this);
				}
			});

			return deferred.promise;
		} else {
			utils.unset(_this.attributes, key);
			return _this;
		}
	}).nodeify(cb);
};
