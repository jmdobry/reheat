module.exports = {

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
	idAttribute: 'id',

	/**
	 * @doc property
	 * @id Model.static_properties:tableName
	 * @name tableName
	 * @description
	 * The name of the table this Model should use. Default: `"test"`. Must be a string.
	 */
	tableName: 'test',

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
	timestamps: false,

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
	softDelete: false,

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
	connection: null,

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
	schema: null,

	get: require('./get'),

	getAll: require('./getAll'),

	filter: require('./filter')
};
