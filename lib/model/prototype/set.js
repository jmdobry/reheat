var errorPrefix = 'Model#set(key[, value][, options][, cb]): ';

module.exports = function (Promise, utils, errors) {
	var IllegalArgumentError = errors.IllegalArgumentError;

	/**
	 * @doc method
	 * @id Model.instance_methods:set
	 * @name set
	 * @description
	 * Set (asynchronously) the given values on this instance.
	 *
	 * ## Signature:
	 * ```js
	 * Model#set(key[, value][, options][, cb])
	 * ```
	 *
	 * ## Examples:
	 *
	 * ### Promise-style:
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
	 *  }, { validate: true }).then(function (contact) {
	 *      // Do something with contact
	 *  })
	 *  .catch(reheat.support.IllegalArgumentError, function (err) {
	 *      res.send(400, err.errors);
	 *  })
	 *  .catch(reheat.support.ValidationError, function (err) {
	 *      err.errors; // { lastName: { errors: ['type'] } }
	 *      res.send(400, err.errors);
	 *  })
	 *  .error(function (err) {
	 *      res.send(500, err.message);
	 *  });
	 * ```
	 *
	 * ### Node-style:
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
	 * ## Throws/Rejects with:
	 *
	 * - `{ValidationError}`
	 * - `{IllegalArgumentError}`
	 *
	 * @param {string|object} key If a string, the key to be set to `value`. Supports nested keys, e.g. `"address.state"`.
	 * If an object, the object will be merged into this instance's attributes.
	 * @param {*} [value] The value to set. Used only if `key` is a string.
	 * @param {boolean|object=} options Optional configuration. May be set to `true` as shorthand for
	 * `{ validate: true }`. Properties:
	 *
	 * - `{boolean=false}` - `validate` - If `true` and the Model of this instance has a schema defined, ensure no schema
	 * validation errors occur with the new attribute(s) before setting, otherwise abort with the
	 * validation error.
	 *
	 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
	 *
	 * - `{ValidationError}` - `err` - `null` if no error occurs. `ValidationError` if a validation error occurs.
	 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which
	 * `set(key[, value][, options][, cb])` was called.
	 * @returns {Promise} Promise.
	 */
	function set(key, value, options, cb) {
		var _this = this;

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

		if (cb && !utils.isFunction(cb)) {
			throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
		}

		return Promise.resolve().then(function sanitize() {
			if (!utils.isObject(options)) {
				throw new IllegalArgumentError(errorPrefix + 'options: Must be an object', { actual: typeof options, expected: 'object' });
			} else if (!utils.isObject(key) && !utils.isString(key)) {
				throw new IllegalArgumentError(errorPrefix + 'key: Must be a string or an object!', { actual: typeof key, expected: 'string|object' });
			}

			if (options.validate && _this.constructor.schema) {
				var clone = utils.clone(_this.attributes),
					deferred = Promise.defer();

				if (utils.isObject(key)) {
					utils.deepMixIn(clone, key);
				} else {
					utils.set(clone, key, value);
				}

				_this.constructor.schema.validate(clone, function (err) {

					// Handle uncaught errors
					if (err) {
						_this.validationError = new errors.ValidationError(errorPrefix + 'key/value: Validation failed!', err);
						throw _this.validationError;
					} else {
						if (utils.isObject(key)) {
							utils.deepMixIn(_this.attributes, key);
						} else {
							utils.set(_this.attributes, key, value);
						}
						deferred.resolve(_this);
					}
				});

				return deferred.promise;
			} else {
				if (utils.isObject(key)) {
					utils.deepMixIn(_this.attributes, key);
				} else {
					utils.set(_this.attributes, key, value);
				}
				return _this;
			}
		}).nodeify(cb);
	}

	return set;
};
