module.exports = function (utils, Model_findOne, Model_prototype, Model_destroyOne) {

	/**
	 * @doc function
	 * @name Model
	 * @description
	 * `Model` is the base class you extend when you use `reheat.defineModel`. A child class of `Model` has a few static
	 * methods and properties. The child class can also be instantiated. Instances have a number of methods available
	 * to them from the prototype of the child class.
	 *
	 * ## Signature:
	 * ```js
	 * new Model([attrs])
	 * ```
	 *
	 * ## Example:
	 *
	 * ```js
	 *  var reheat = require('reheat'),
	 *      connection = new reheat.Connection();
	 *
	 *  var Post = reheat.defineModel('Post', {
	 *          connection: connection,
	 *          tableName: 'post',
	 *          softDelete: true
	 *      }, {
	 *          beforeCreate: function(cb) {
	 *              console.log('before create lifecycle step!');
	 *              cb();
	 *          }
	 *      }),
	 *      Posts = Post.collection;
	 *
	 *
	 *  // All prototype properties and methods will be available on instances of Post.
	 *  var post = new Post();
	 *
	 *  // All static properties and methods will be available on Post itself.
	 *  Post.tableName; //  'post'
	 *  Post.idAttribute; //  'id'
	 *  Post.connection.run(r.tableList(), function (err, tables) {});
	 *  Posts.findAll({}, function (err, posts) {
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
		this.attributes = utils.merge({}, attrs);

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
	utils.deepMixIn(Model.prototype, Model_prototype);

	Model.findOne = Model_findOne;
	Model.get = function () {
		console.warn('Model#get is deprecated! Please use Model#findOne.');
		var args = Array.prototype.slice(arguments);
		return this.findOne.apply(this, args);
	};
	Model.destroyOne = Model_destroyOne;
	Model.filter = function () {
		console.warn('Model#filter is deprecated! Please use Collection#findAll.');
		var args = Array.prototype.slice(arguments);
		return this.collection.findAll.apply(this.collection, args);
	};
	Model.findAll = function () {
		console.warn('Model#findAll is not recommended! Please use Collection#findAll.');
		var args = Array.prototype.slice(arguments);
		return this.collection.findAll.apply(this.collection, args);
	};
	Model.getAll = function () {
		console.warn('Model#getAll is deprecated! Please use Collection#getAll.');
		var args = Array.prototype.slice(arguments);
		return this.collection.getAll.apply(this.collection, args);
	};

	/**
	 * @doc property
	 * @id Model.static_properties:idAttribute
	 * @name idAttribute
	 * @description
	 * The property name to be used as the primary key for this Model. Default: `"id"`. Must be a string.
	 *
	 * Example:
	 *
	 * ```js
	 *  var Post = reheat.defineModel('Post', {
	 *      connection: new Connection(),
	 *      tableName: 'post',
	 *      idAttribute: '_id'
	 *  });
	 *
	 *  var post = new Post();
	 *
	 *  post.save(function (err, post) {
	 *      post.toJSON();  //  { _id: 'f019b593-e380-47b7-ad60-ae851811b4b8' }
	 *  });
	 * ```
	 */
	Model.idAttribute = 'id';

	/**
	 * @doc property
	 * @id Model.static_properties:tableName
	 * @name tableName
	 * @description
	 * The name of the table this Model should use. Default: toLowerCase() of the new Model name. Must be a string.
	 */
	Model.tableName = '';

	/**
	 * @doc property
	 * @id Model.static_properties:timestamps
	 * @name timestamps
	 * @description
	 * Whether to auto-manage the `created`, `updated` and `deleted` fields for all instances of this Model. If set to
	 * `true` then reheat will automatically add and update these fields for instances of this Model. Default: `false`.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: Model.timestamps example
	 * ```
	 */
	Model.timestamps = false;

	/**
	 * @doc property
	 * @id Model.static_properties:softDelete
	 * @name softDelete
	 * @description
	 * Whether to "soft-delete" instances of this Model. "soft-deleted" rows are not deleted from the table, but
	 * updated with a `deleted` field set to the UTC datetime (of the database) at which the operation occurs. Default:
	 * `false`.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: Model.softDelete example
	 * ```
	 */
	Model.softDelete = false;

	/**
	 * @doc property
	 * @id Model.static_properties:connection
	 * @name connection
	 * @description
	 * The instance of `Connection` this Model should use. Default: `null`.
	 *
	 * Example:
	 *
	 * ```js
	 *  var Post = reheat.defineModel('Post', {
	 *      connection: new Connection({
	 *          db: 'production',
	 *          host: '123.45.67.890',
	 *          authKey: 'mySecret',
	 *
	 *          max: 20,
	 *          min: 10
	 *      }),
	 *      tableName: 'post'
	 *  });
	 * ```
	 */
	Model.connection = null;

	/**
	 * @doc property
	 * @id Model.static_properties:schema
	 * @name schema
	 * @description
	 * Schema this Model should use. Default: `null`.
	 *
	 * Example:
	 *
	 * ```js
	 *  var Post = reheat.defineModel('Post', {
	 *      connection: new Connection(),
	 *      tableName: 'post',
	 *      schema: reheat.defineSchema('Post', {
	 *          author: {
	 *              type: 'string',
	 *              maxLength: 255,
	 *              nullable: false
	 *          },
	 *          title: {
	 *              type: 'string',
	 *              maxLength: 255
	 *          },
	 *          body: {
	 *              type: 'string',
	 *              maxLength: 5000
	 *          }
	 *      })
	 *  });
	 * ```
	 */
	Model.schema = null;

	return Model;
};
