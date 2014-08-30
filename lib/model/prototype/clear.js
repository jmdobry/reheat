var errorPrefix = 'Model#clear([options], cb): ';

module.exports = function (Promise, utils, errors) {
  var IllegalArgumentError = errors.IllegalArgumentError;

  /**
   * @doc method
   * @id Model.instance_methods:clear
   * @name clear
   * @description
   * Clear (asynchronously) the attributes of this instance of Model.
   *
   * ## Signature:
   * ```js
   * Model#clear([options][, cb])
   * ```
   *
   * ## Examples:
   *
   * ### Promise-style:
   * ```js
   *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
   *
   *  contact.clear(true).then(function (contact) {
	 *      // do something with contact
	 *  })
   *  .catch(reheat.support.ValidationError, function (err) {
	 *      // handle validation error
	 *  });
   * ```
   *
   * ### Node-style:
   * ```js
   *  contact.toJSON();   //  { address: { state: 'NY' }, firstName: 'John' }
   *
   *  contact.clear(function (err, contact) {
	 *      err; // undefined
	 *      contact.toJSON();   //  { }
	 *  });
   * ```
   *
   * ## Throws/Rejects with:
   *
   * - `{ValidationError}`
   * - `{IllegalArgumentError}`
   * - `{UnhandledError}`
   *
   * @param {boolean|object=} options Optional configuration. Properties:
   *
   * - `{boolean=false}` - `validate` - If `true` and the Model of this instance has a schema defined, ensure no schema
   * validation errors occur with the new attribute(s) before clearing.
   *
   * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err)`. Arguments:
   *
   * - `{ValidationError|IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs. `ValidationError` if a validation error occurs and
   * `UnhandledError` for any other error.
   * @returns {Promise} Promise.
   */
  function clear(options, cb) {
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

    return Promise.resolve().then(function sanitize() {
      if (!utils.isObject(options)) {
        throw new IllegalArgumentError(errorPrefix + 'options: Must be an object', { actual: typeof options, expected: 'object' });
      }

      if (options.validate && _this.constructor.schema) {
        var deferred = Promise.defer();

        _this.constructor.schema.validate({}, function (err) {
          if (err) {
            _this.validationError = new errors.ValidationError(errorPrefix + 'Validation failed!', err);
            throw _this.validationError;
          } else {
            _this.attributes = {};
            deferred.resolve(_this);
          }
        });

        return deferred.promise;
      } else {
        _this.attributes = {};
        return _this;
      }
    }).nodeify(cb);
  }

  return clear;
};
