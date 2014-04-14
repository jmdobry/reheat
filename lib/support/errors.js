/**
 * @doc function
 * @id support.error_types:IllegalArgumentError
 * @name IllegalArgumentError
 * @description Error that is thrown/returned when a caller does not honor the pre-conditions of a method/function.
 *
 * Example:
 *
 * ```js
 *  var reheat = require('reheat');
 *
 *  {...}
 *
 *  post.setSync(1234, 1234);
 *
 *  post.validate(function (err) {
 *      err instanceof reheat.support.IllegalArgumentError;   //  true
 *  });
 * ```
 *
 * @param {string=} message Error message. Default: `"Illegal Argument!"`.
 * @param {object=} errors Object containing information about the error.
 * @returns {IllegalArgumentError} A new instance of `IllegalArgumentError`.
 */
function IllegalArgumentError(message, errors) {
	Error.call(this);
	Error.captureStackTrace(this, this.constructor);

	/**
	 * @doc property
	 * @id support.error_types:IllegalArgumentError.type
	 * @name type
	 * @propertyOf support.error_types:IllegalArgumentError
	 * @description Name of error type. Default: `"IllegalArgumentError"`.
	 *
	 * Example:
	 *
	 * ```js
	 *  var reheat = require('reheat');
	 *
	 *  {...}
	 *
	 *  post.setSync(1234, 1234);
	 *
	 *  post.validate(function (err) {
	 *      err.type;   //  "IllegalArgumentError"
	 *  });
	 * ```
	 */
	this.type = this.constructor.name;

	/**
	 * @doc property
	 * @id support.error_types:IllegalArgumentError.errors
	 * @name errors
	 * @propertyOf support.error_types:IllegalArgumentError
	 * @description Object containing information about the error.
	 *
	 * Example:
	 *
	 * ```js
	 *  var reheat = require('reheat');
	 *
	 *  {...}
	 *
	 *  post.setSync(1234, 1234);
	 *
	 *  post.validate(function (err) {
	 *      err.errors; //  {
	 *                  //      actual: 'number',
	 *                  //      expected: 'string|object'
	 *                  //  }
	 *  });
	 * ```
	 */
	this.errors = errors || {};

	/**
	 * @doc property
	 * @id support.error_types:IllegalArgumentError.message
	 * @name message
	 * @propertyOf support.error_types:IllegalArgumentError
	 * @description Error message. Default: `"Illegal Argument!"`.
	 *
	 * Example:
	 *
	 * ```js
	 *  var reheat = require('reheat');
	 *
	 *  {...}
	 *
	 *  post.setSync(1234, 1234);
	 *
	 *  post.validate(function (err) {
	 *      err.message;   //  "Post#set(key[, value][, options], cb): key: Must be a string or an object!"
	 *  });
	 * ```
	 */
	this.message = message || 'Illegal Argument!';
}

IllegalArgumentError.prototype = Object.create(Error.prototype);
IllegalArgumentError.prototype.constructor = IllegalArgumentError;

/**
 * @doc function
 * @id support.error_types:RuntimeError
 * @name RuntimeError
 * @description Error that is thrown/returned when a caller does not honor the pre-conditions of a method/function.
 *
 * Example:
 *
 * ```js
 *  var reheat = require('reheat');
 *
 *  {...}
 *
 *  post.setSync(1234, 1234);
 *
 *  post.validate(function (err) {
 *      err instanceof reheat.support.RuntimeError;   //  true
 *  });
 * ```
 *
 * @param {string=} message Error message. Default: `"Illegal Argument!"`.
 * @param {object=} errors Object containing information about the error.
 * @returns {RuntimeError} A new instance of `RuntimeError`.
 */
function RuntimeError(message, errors) {
	Error.call(this);
	Error.captureStackTrace(this, this.constructor);

	/**
	 * @doc property
	 * @id support.error_types:RuntimeError.type
	 * @name type
	 * @propertyOf support.error_types:RuntimeError
	 * @description Name of error type. Default: `"RuntimeError"`.
	 *
	 * Example:
	 *
	 * ```js
	 *  var reheat = require('reheat');
	 *
	 *  {...}
	 *
	 *  post.setSync(1234, 1234);
	 *
	 *  post.validate(function (err) {
	 *      err.type;   //  "RuntimeError"
	 *  });
	 * ```
	 */
	this.type = this.constructor.name;

	/**
	 * @doc property
	 * @id support.error_types:RuntimeError.errors
	 * @name errors
	 * @propertyOf support.error_types:RuntimeError
	 * @description Object containing information about the error.
	 *
	 * Example:
	 *
	 * ```js
	 *  var reheat = require('reheat');
	 *
	 *  {...}
	 *
	 *  post.setSync(1234, 1234);
	 *
	 *  post.validate(function (err) {
	 *      err.errors; //  {
	 *                  //      actual: 'number',
	 *                  //      expected: 'string|object'
	 *                  //  }
	 *  });
	 * ```
	 */
	this.errors = errors || {};

	/**
	 * @doc property
	 * @id support.error_types:RuntimeError.message
	 * @name message
	 * @propertyOf support.error_types:RuntimeError
	 * @description Error message. Default: `"Illegal Argument!"`.
	 *
	 * Example:
	 *
	 * ```js
	 *  var reheat = require('reheat');
	 *
	 *  {...}
	 *
	 *  post.setSync(1234, 1234);
	 *
	 *  post.validate(function (err) {
	 *      err.message;   //  "Post#set(key[, value][, options], cb): key: Must be a string or an object!"
	 *  });
	 * ```
	 */
	this.message = message || 'Illegal Argument!';
}

RuntimeError.prototype = Object.create(Error.prototype);
RuntimeError.prototype.constructor = RuntimeError;

/**
 * @doc function
 * @id support.error_types:ValidationError
 * @name ValidationError
 * @description Error that is thrown/returned when validation of a schema fails.
 *
 * Example:
 *
 * ```js
 *  var reheat = require('reheat');
 *
 *  {...}
 *
 *  post.setSync('author', 1234);
 *
 *  post.validate(function (err) {
 *      err instanceof reheat.support.ValidationError;   //  true
 *  });
 * ```
 *
 * @param {string=} message Error message. Default: `"Validation Error!"`.
 * @param {object=} errors Object containing information about the error.
 * @returns {ValidationError} A new instance of `ValidationError`.
 */
function ValidationError(message, errors) {
	Error.call(this);
	Error.captureStackTrace(this, this.constructor);

	/**
	 * @doc property
	 * @id support.error_types:ValidationError.type
	 * @name type
	 * @propertyOf support.error_types:ValidationError
	 * @description Name of error type. Default: `"ValidationError"`.
	 *
	 * Example:
	 *
	 * ```js
	 *  var reheat = require('reheat');
	 *
	 *  {...}
	 *
	 *  post.setSync('author', 1234);
	 *
	 *  post.validate(function (err) {
	 *      err.type;   //  "ValidationError"
	 *  });
	 * ```
	 */
	this.type = this.constructor.name;

	/**
	 * @doc property
	 * @id support.error_types:ValidationError.errors
	 * @name errors
	 * @propertyOf support.error_types:ValidationError
	 * @description Object containing information about the error.
	 *
	 * Example:
	 *
	 * ```js
	 *  var reheat = require('reheat');
	 *
	 *  {...}
	 *
	 *  post.setSync('author', 1234);
	 *
	 *  post.validate(function (err) {
	 *      err.errors; //  {
	 *                  //      author: {
	 *                  //          errors: [{
	 *                  //              rule: 'type',
	 *                  //              actual: 'number',
	 *                  //              expected: 'string'
	 *                  //          }]
	 *                  //      }
	 *                  //  }
	 *  });
	 * ```
	 */
	this.errors = errors || {};

	/**
	 * @doc property
	 * @id support.error_types:ValidationError.message
	 * @name message
	 * @propertyOf support.error_types:ValidationError
	 * @description Error message. Default: `"Validation Error!"`.
	 *
	 * Example:
	 *
	 * ```js
	 *  var reheat = require('reheat');
	 *
	 *  {...}
	 *
	 *  post.setSync('author', 1234);
	 *
	 *  post.validate(function (err) {
	 *      err.message;   //  "Post#validate(cb): Validation failed!"
	 *  });
	 * ```
	 */
	this.message = message || 'Validation Error!';
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

/**
 * @doc interface
 * @id support
 * @name Reheat support classes
 * @description
 * `reheat.support` gives access to `IllegalArgumentError`, `RuntimeError` and `ValidationError`.
 */
module.exports = function () {
	return {
		IllegalArgumentError: IllegalArgumentError,
		RuntimeError: RuntimeError,
		ValidationError: ValidationError
	};
};
