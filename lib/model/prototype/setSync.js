var errorPrefix = 'Model#setSync(key[, value][, options]): ';

module.exports = function (utils, errors) {
  var IllegalArgumentError = errors.IllegalArgumentError,
    ValidationError = errors.ValidationError,
    UnhandledError = errors.UnhandledError;

  /**
   * @doc method
   * @id Model.instance_methods:setSync
   * @name setSync
   * @description
   * Set (synchronously) the given values on this instance.
   *
   * ## Signature:
   * ```js
   * Model#setSync(key[, value][, options])
   * ```
   *
   * ## Example:
   *
   * ```js
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
   * ```
   *
   * ## Throws:
   *
   * - `{IllegalArgumentError}` - Argument `key` must be a string or an object.
   * - `{IllegalArgumentError}` - Argument `options` must be a boolean or an object.
   * - `{ValidationError}` - Argument `options` must be a boolean or an object.
   * - `{UnhandledError}` - Thrown if `options === true` or `options.validate === true` and validation fails.
   *
   * @param {string|object} key If a string, the key to be set to `value`. Supports nested keys, e.g. `"address.state"`.
   * If an object, the object will be merged into this instance's attributes.
   * @param {*=} value The value to set. Used only if `key` is a string.
   * @param {boolean|object=} options Optional configuration. May be set to `true` as shorthand for `{ validate: true }`.
   * Properties:
   *
   * - `{boolean=false}` - `validate` - If `true` and the Model of this instance has a schema defined, ensure no schema
   * validation errors occur with the new attribute(s) before setting, otherwise abort with the
   * validation error.
   */
  function setSync(key, value, options) {
    // Check pre-conditions
    if (utils.isObject(key) && !options) {
      options = value;
    }
    options = options ? (options === true ? { validate: true } : options) : {};
    if (!utils.isObject(options)) {
      throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
    } else if (!utils.isObject(key) && !utils.isString(key)) {
      throw new IllegalArgumentError(errorPrefix + 'key: Must be a string or an object!', { actual: typeof key, expected: 'string|object' });
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
          this.validationError = new ValidationError(errorPrefix + 'key/value: Validation failed!', err);
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
      if (err instanceof ValidationError) {
        throw err;
      } else {
        throw new UnhandledError(err);
      }
    }
  }

  return setSync;
};
