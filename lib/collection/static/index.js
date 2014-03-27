module.exports = function (container) {
	return {

		/**
		 * @doc property
		 * @id Collection.static_properties:model
		 * @name schema
		 * @description
		 * Model this Collection should use. Default: `null`.
		 *
		 * Example:
		 *
		 * ```js
		 * TODO
		 * ```
		 */
		model: null,

		getAll: container.resolve(require('./getAll')),

		filter: container.resolve(require('./filter'))
	};
};
