module.exports = {

	/**
	 * @member {string} Model.idAttribute
	 * @desc The property name to be used as the primary key for this Model.
	 * @abstract
	 * @static
	 * @default id
	 * @example
	 *  var Post = Model.extend(null, {
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
	 */
	idAttribute: 'id',

	/**
	 * @member {string} Model.tableName
	 * @desc The name of the table this Model should use.
	 * @abstract
	 * @static
	 * @default test
	 */
	tableName: 'test',

	/**
	 * @member {string} Model.connection
	 * @desc The instance of {@link Connection} this Model should use.
	 * @abstract
	 * @static
	 * @default null
	 * @example
	 *  var Post = Model.extend(null, {
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
	 */
	connection: null,

	/**
	 * @member {string} Model.schema
	 * @desc The instance of {@link robocop.Schema} this Model should use.
	 * @abstract
	 * @static
	 * @default null
	 * @example
	 *  var Post = Model.extend(null, {
	 *      connection: new Connection(),
	 *      tableName: 'post',
	 *      schema: new Schema('Post', {
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
	 */
	schema: null,

	/**
	 * @see Model.get
	 */
	get: require('./get'),

	/**
	 * @see Model.getAll
	 */
	getAll: require('./getAll'),

	/**
	 * @see Model.filter
	 */
	filter: require('./filter'),

	/**
	 * @see Model.count
	 */
	count: require('./count'),

	/**
	 * @see Model.sum
	 */
	sum: require('./sum'),

	/**
	 * @see Model.avg
	 */
	avg: require('./avg')
};
