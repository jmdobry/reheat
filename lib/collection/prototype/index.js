module.exports = function (utils, errors) {
	return {

		/**
		 * @doc method
		 * @id Collection.instance_methods:initialize
		 * @name initialize( )
		 * @description
		 * Called at the end of construction of Collection instances. Used to execute custom initialization logic when
		 * creating new instances of a Collection.
		 *
		 * Example:
		 *
		 * ```js
		 * TODO
		 * ```
		 */
		initialize: function () {
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:toJSON
		 * @name toJSON( )
		 * @description
		 * Return the plain attributes of the Model instances in this collection. Override this method to se your own
		 * custom serialization.
		 *
		 * Example:
		 *
		 * ```js
		 * TODO:
		 * ```
		 *
		 * ## Throws
		 *
		 * - `{UnhandledError}` - Thrown for any uncaught exception.
		 *
		 * @returns {object} The plain attributes of this instance.
		 */
		toJSON: function () {
			try {
				var clonedArray = [];
				utils.forEach(this.models, function (model) {
					var toKeep = [];
					var clone = {};
					utils.forOwn(model.attributes, function (value, key) {
						if (utils.isObject(value) && value.constructor.__reheat_super__) {
							clone[key] = value.toJSON();
						} else if (utils.isArray(value) && value.length && utils.isObject(value[0]) && value[0].constructor.__reheat_super__) {
							clone[key] = [];
							for (var i = 0; i < value.length; i++) {
								clone[key].push(value[i].toJSON());
							}
						} else {
							toKeep.push(key);
						}
					});
					clone = utils.deepMixIn(clone, utils.pick(model.attributes, toKeep));
					clonedArray.push(clone);
				});
				return clonedArray;
			} catch (err) {
				throw new errors.UnhandledError(err);
			}
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:functions
		 * @name functions( )
		 * @description
		 * Return an array of available methods on this collection instance.
		 *
		 * Example:
		 *
		 * ```js
		 * TODO: Collection#functions() example
		 * ```
		 *
		 * ## Throws
		 *
		 * - `{UnhandledError}` - Thrown for any uncaught exception.
		 *
		 * @returns {array} Array of available functions on this instance.
		 */
		functions: function () {
			try {
				return utils.functions(this);
			} catch (err) {
				throw new errors.UnhandledError(err);
			}
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:clone
		 * @name clone( )
		 * @description
		 * Clone this collection instance.
		 *
		 * Example:
		 *
		 * ```js
		 *  contacts.toJSON();   //  [{ address: { state: 'NY' }, firstName: 'John' }]
		 *
		 *  var cloned = contacts.clone();
		 *
		 *  cloned.toJSON();   //  [{ address: { state: 'NY' }, firstName: 'John' }]
		 *  cloned.setSync('firstName', 'Sally');
		 *
		 *  cloned.toJSON();   //  [{ address: { state: 'NY' }, firstName: 'Sally' }]
		 *  contact.toJSON();   //  [{ address: { state: 'NY' }, firstName: 'John' }]
		 * ```
		 *
		 * ## Throws
		 *
		 * - `{UnhandledError}` - Thrown for any uncaught exception.
		 *
		 * @returns {*} A new collection instance identical to this collection instance.
		 */
		clone: function () {
			throw new Error('not implemented!');
		},

		/**
		 * @doc method
		 * @id Collection.instance_methods:hasNew
		 * @name hasNew( )
		 * @description
		 * Return `true` if this collections contains model instances that have not yet been saved to the database
		 * (lack the property specified by `Collection.model.idAttribute`, which defaults to `"id"`).
		 *
		 * ## Signature:
		 * ```js
		 * Collection#hasNew()
		 * ```
		 *
		 * ## Example:
		 *
		 * ```js
		 *  contacts.toJSON();   //  [{ address: { state: 'NY' }, firstName: 'John' }]
		 *  contacts.hasNew();   //  true
		 *
		 *  contacts.save(function (err, contacts) {
		 *      contacts.toJSON();   //  [{ id: 45, address: { state: 'NY' }, firstName: 'John' }]
		 *      contacts.hasNew();    //  false
		 *  });
		 *  ```
		 *
		 * @returns {boolean} Whether this collection contains model instances that have not been saved to the database.
		 */
		hasNew: function () {
			throw new Error('not implemented!');
		}
	};
};
