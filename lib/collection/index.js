module.exports = function (container, utils, errors) {

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
			this.reset.call(this, models, options);
		}
	}

	// Mix in prototype methods and properties
	utils.deepMixIn(Collection.prototype, container.resolve(require('./prototype')));

	// Mix in static methods and properties
	utils.deepMixIn(Collection, container.resolve(require('./static')));

	return Collection;
};
