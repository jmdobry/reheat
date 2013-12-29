module.exports = {
	/**
	 * @class UnhandledError
	 * @desc Error that is thrown/returned around an uncaught/unknown exception.
	 * @param {Error} error The originally thrown error.
	 */
	UnhandledError: function UnhandledError(error) {
		Error.call(this);
		Error.captureStackTrace(this, this.constructor);

		/**
		 * @member {string} UnhandledError#type
		 * @desc Name of error type.
		 * @instance
		 * @default <code>'UnhandledError'</code>
		 */
		this.type = this.constructor.name;

		/**
		 * @member {Error} UnhandledError#originalError
		 * @desc A reference to the original error that was thrown.
		 * @instance
		 */
		this.originalError = error;

		/**
		 * @member {string} UnhandledError#message
		 * @desc Message and stack trace. Same as {@link UnhandledError#stack}.
		 * @instance
		 */
		this.message = 'UnhandledError: This is an uncaught exception. Please consider submitting an issue at https://github.com/jmdobry/reheat/issues.\n\n' +
			'Original Uncaught Exception:\n' + (error.stack ? error.stack.toString() : error.stack);

		/**
		 * @member {string} UnhandledError#stack
		 * @desc Message and stack trace. Same as {@link UnhandledError#message}.
		 * @instance
		 */
		this.stack = this.message;
	},

	/**
	 * @class IllegalArgumentError
	 * @desc Error that is thrown/returned when a caller does not honor the pre-conditions of a method/function.
	 * @param {string} [message='Illegal Argument!'] Error message.
	 * @param {object} [errors={}] Object containing information about the error.
	 */
	IllegalArgumentError: function IllegalArgumentError(message, errors) {
		Error.call(this);
		Error.captureStackTrace(this, this.constructor);

		/**
		 * @member {string} IllegalArgumentError#type
		 * @desc Name of error type.
		 * @instance
		 */
		this.type = this.constructor.name;

		/**
		 * @member {object} IllegalArgumentError#errors
		 * @desc Object containing information about the error.
		 * @instance
		 * @default <code>{}</code>
		 */
		this.errors = errors || {};

		/**
		 * @member {string} IllegalArgumentError#message
		 * @desc Error message.
		 * @instance
		 * @default <code>'Illegal Argument!'</code>
		 */
		this.message = message || 'Illegal Argument!';
	},

	/**
	 * @class ValidationError
	 * @desc Error that is thrown/returned when validation of a schema fails
	 * @param {string} [message='Validation Error'] Error message.
	 * @param {object} [errors={}] Object containing information about the error.
	 */
	ValidationError: function ValidationError(message, errors) {
		Error.call(this);
		Error.captureStackTrace(this, this.constructor);

		/**
		 * @member {string} ValidationError#type
		 * @desc Name of error type.
		 * @instance
		 * @default <code>'ValidationError'</code>
		 */
		this.type = this.constructor.name;

		/**
		 * @member {object} ValidationError#errors
		 * @desc Object containing information about the error.
		 * @instance
		 * @default <code>{}</code>
		 */
		this.errors = errors || {};

		/**
		 * @member {string} ValidationError#message
		 * @desc Error message.
		 * @instance
		 * @default <code>'Illegal Argument!'</code>
		 */
		this.message = message || 'Validation Error!';
	}
};
