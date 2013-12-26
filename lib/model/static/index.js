var get = require('./get'),
	getAll = require('./getAll'),
	filter = require('./filter'),
	count = require('./count'),
	sum = require('./sum'),
	avg = require('./avg');

module.exports = {

	/**
	 * @member {string} Model.idAttribute
	 * @desc The property name to be used as the primary key for this Model.
	 * @abstract
	 * @static
	 * @default id
	 */
	idAttribute: 'id',

	/**
	 * @member {string} Model.tableName
	 * @desc the name of the table this Model should use.
	 * @abstract
	 * @static
	 * @default test
	 */
	tableName: 'test',

	/**
	 * @member {string} Model.connection
	 * @desc The instance of Connection this Model should use.
	 * @abstract
	 * @static
	 * @default null
	 */
	connection: null,

	/**
	 * @member {string} Model.schema
	 * @desc The instance of Schema this Model should use.
	 * @abstract
	 * @static
	 * @default null
	 */
	schema: null,

	/**
	 * @see Model.get
	 */
	get: function (primaryKey, options, cb) {
		get.apply(this, [primaryKey, options, cb]);
	},

	/**
	 * @see Model.getAll
	 */
	getAll: function (keys, index, options, cb) {
		getAll.apply(this, [keys, index, options, cb]);
	},

	/**
	 * @see Model.filter
	 */
	filter: function (predicate, options, cb) {
		filter.apply(this, [predicate, options, cb]);
	},

	/**
	 * @see Model.count
	 */
	count: function (predicate, options, cb) {
		count.apply(this, [predicate, options, cb]);
	},

	/**
	 * @see Model.sum
	 */
	sum: function (predicate, options, cb) {
		sum.apply(this, [predicate, options, cb]);
	},

	/**
	 * @see Model.avg
	 */
	avg: function (predicate, options, cb) {
		avg.apply(this, [predicate, options, cb]);
	}
};
