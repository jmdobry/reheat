module.exports = function (container, utils, errors, Collection_prototype, Collection_filter, Collection_getAll) {

	/**
	 * @doc function
	 * @name Collection
	 * @description
	 * If an instance of `Model` represents a row in table, then an instance of `Collection` represents a whole table, or a
	 * subset of the rows of a table, or some set of rows that are somehow related.
	 *
	 * ## Example:
	 *
	 * ```js
	 *  var reheat = require('reheat'),
	 *      Post = require('../models/Post');
	 *
	 *  var Posts = reheat.defineCollection('Posts', {
	 *      model: Post
	 *  });
	 *
	 *  // All prototype properties and methods will be available on instances of Post.
	 *  var posts = new Posts([
	 *      {
	 *          author: 'John Anderson',
	 *          title: 'How NOT to cook'
	 *      },
	 *      {
	 *          author: 'Sally Johnson',
	 *          title: 'How to cook'
	 *      }
	 *  ]);
	 * ```
	 *
	 * See [reheat.defineModel](/documentation/api/api/reheat.defineCollection).
	 */
	function Collection(models, options) {

		if (utils.isObject(models)) {
			if (!options) {
				options = models;
				models = [];
			} else {
				throw new errors.IllegalArgumentError('new Collection([models][, options]): models: Must be an array!', { actual: typeof models, expected: 'array' });
			}
		} else if (models && !utils.isArray(models)) {
			throw new errors.IllegalArgumentError('new Collection([models][, options]): models: Must be an array!', { actual: typeof models, expected: 'array' });
		} else if (options && !utils.isObject(options)) {
			throw new errors.IllegalArgumentError('new Collection([models][, options]): options: Must be an object!', { actual: typeof options, expected: 'object' });
		}
		options = options || {};

		this.models = [];
		this.index = {};

		this.initialize.apply(this, arguments);

		if (models) {
			this.reset.call(this, models);
		}
	}

	// Mix in prototype methods and properties
	utils.deepMixIn(Collection.prototype, Collection_prototype);

	/**
	 * @doc property
	 * @id Collection.static_properties:model
	 * @name model
	 * @description
	 * Model that this Collection should use.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO
	 * ```
	 */
	Collection.model = null;

	Collection.filter = Collection_filter;
	Collection.getAll = Collection_getAll;

	return Collection;
};
