module.exports = {
	/**
	 * @class UnhandledError
	 * @desc Error that is thrown/returned around an uncaught/unknown exception.
	 * @param {Error} error
	 * @constructor
	 */
	UnhandledError: function UnhandledError(error) {
		Error.call(this);
		Error.captureStackTrace(this, this.constructor);

		this.type = this.constructor.name;
		this.originalError = error;
		this.message = 'UnhandledError: This is an uncaught exception. Please consider submitting an issue at https://github.com/jmdobry/reheat/issues.\n\n' +
			'Original Uncaught Exception:\n' + error.stack.toString();
		this.stack = this.message;
	},

	/**
	 * @class IllegalArgumentError
	 * @desc Error that is thrown/returned when a caller does not honor the pre-conditions of a method/function.
	 * @param {string} message
	 * @param {object} [errors]
	 * @constructor
	 */
	IllegalArgumentError: function IllegalArgumentError(message, errors) {
		Error.call(this);
		Error.captureStackTrace(this, this.constructor);

		this.type = this.constructor.name;
		this.errors = errors;
		this.message = message;
	},

	/**
	 * @class ValidationError
	 * @desc Error that is thrown/returned when validation of a schema fails
	 * @param {string} message
	 * @param {object} [errors]
	 * @constructor
	 */
	ValidationError: function ValidationError(message, errors) {
		Error.call(this);
		Error.captureStackTrace(this, this.constructor);

		this.type = this.constructor.name;
		this.errors = errors;
		this.message = message;
	}
};
