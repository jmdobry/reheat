module.exports = function (container, utils) {

	/**
	 * @doc function
	 * @name Model
	 * @description
	 * `Model` provides validation and lifecycle methods to class instances. All static methods of a model return instances of that model by default.
	 *
	 * ## Example:
	 *
	 * ```js
	 *  var reheat = require('reheat'),
	 *      connection = new reheat.Connection();
	 *
	 *  var Post = reheat.defineModel('Post', {
	 *      connection: connection,
	 *      tableName: 'post',
	 *      softDelete: true
	 *  }, {
	 *      beforeCreate: function(cb) {
	 *          console.log('before create lifecycle step!');
	 *          cb();
	 *      }
	 *  });
	 *
	 *  // All prototype properties and methods will be available on instances of Post.
	 *  var post = new Post();
	 *
	 *  // All static properties and methods will be available on Post itself.
	 *  Post.tableName; //  'post'
	 *  Post.idAttribute; //  'id'
	 *  Post.connection.run(r.tableList(), function (err, tables) {});
	 *  Post.filter(function (err, posts) {
	 *      posts;  //  All posts in the "post" table
	 *  });
	 * ```
	 *
	 * See [reheat.defineModel](/documentation/api/api/reheat.defineModel).
	 */
	function Model(attrs) {

		attrs = attrs || {};

		/**
		 * @doc property
		 * @id Model.instance_properties:attributes
		 * @name attributes
		 * @description
		 * The internal hash of attributes of this instance of Model. Do not modify this directly, as tracked changes
		 * will be lost, and validation will be skipped. Instead, use Model#set or Model#setSync and Model#get.
		 */
		this.attributes = {};
		utils.deepMixIn(this.attributes, attrs);

		/**
		 * @doc property
		 * @id Model.instance_properties:previousAttributes
		 * @name previousAttributes
		 * @description
		 * The internal hash of attributes from the last time this instance was saved.
		 */
		this.previousAttributes = {};
		utils.deepMixIn(this.previousAttributes, attrs);

		/**
		 * @doc property
		 * @id Model.instance_properties:changed
		 * @name changed
		 * @description
		 * The internal hash of changed attributes since the last save to the database.
		 */
		this.changed = null;
		// TODO: Keep track of changes

		/**
		 * @doc property
		 * @id Model.instance_properties:validationError
		 * @name validationError
		 * @description
		 * The error returned by the last failed validation.
		 */
		this.validationError = null;

		this.initialize.apply(this, arguments);
	}

	// Mix in prototype methods and properties
	utils.deepMixIn(Model.prototype, container.resolve(require('./prototype')));

	// Mix in static methods and properties
	utils.deepMixIn(Model, container.resolve(require('./static')));

	return Model;
};
