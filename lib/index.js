/*jshint loopfunc:true*/

var container = require('./config').container,
	rethinkdbdash = require('rethinkdbdash'),
	errorPrefix = 'reheat.defineModel(name, staticProps[, protoProps]): ',
	errorPrefix2 = 'reheat.defineCollection(name, staticProps[, protoProps]): ';

/**
 * @doc interface
 * @id reheat
 * @name reheat
 */
var reheat = module.exports = {};

container.resolve(function (r, Promise, robocop, utils, errors, extend, Model, Collection, Connection, models, collections) {

	function evaluateRelations() {
		utils.forOwn(models, function (model, modelName) {
			if ('hasOne' in model.relations && !utils.isObject(model.relations.hasOne)) {
				throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.hasOne: Must be an object!', { actual: typeof model.relations.hasOne, expected: 'object' });
			} else if ('belongsTo' in model.relations && !utils.isObject(model.relations.belongsTo)) {
				throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.belongsTo: Must be an object!', { actual: typeof model.relations.belongsTo, expected: 'object' });
			} else if ('hasMany' in model.relations && !utils.isObject(model.relations.hasMany)) {
				throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.hasMany: Must be an object!', { actual: typeof model.relations.hasMany, expected: 'object' });
			}

			model.relations.hasOne = model.relations.hasOne || {};
			model.relations.belongsTo = model.relations.belongsTo || {};
			model.relations.hasMany = model.relations.hasMany || {};

			utils.forOwn(model.relations.hasOne, function (relation, relationModelName) {
				if (!utils.isObject(relation)) {
					throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.hasOne.' + relationModelName + ': Must be an object!', { actual: typeof relation, expected: 'object' });
				} else if ('localField' in relation && !utils.isString(relation.localField)) {
					throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.hasOne.' + relationModelName + '.localField: Must be a string!', { actual: typeof relation.localField, expected: 'string' });
				} else if ('foreignKey' in relation && !utils.isString(relation.foreignKey)) {
					throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.hasOne.' + relationModelName + '.foreignKey: Must be a string!', { actual: typeof relation.foreignKey, expected: 'string' });
				}
				if (!('localField' in relation)) {
					relation.localField = utils.camelCase(relationModelName);
				}
				if (!('foreignKey' in relation)) {
					relation.foreignKey = utils.camelCase(relationModelName) + 'Id';
				}
				if (models[relationModelName] && !models[relationModelName].relations.indices[relation.foreignKey]) {
					models[relationModelName].relations.indices[relation.foreignKey] = null;
				}
			});

			utils.forOwn(model.relations.belongsTo, function (relation, relationModelName) {
				if (!utils.isObject(relation)) {
					throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.' + relationModelName + ': Must be an object!', { actual: typeof relation, expected: 'object' });
				} else if ('localField' in relation && !utils.isString(relation.localField)) {
					throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.belongsTo.' + relationModelName + '.localField: Must be a string!', { actual: typeof relation.localField, expected: 'string' });
				} else if ('localKey' in relation && !utils.isString(relation.localKey)) {
					throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.belongsTo.' + relationModelName + '.localKey: Must be a string!', { actual: typeof relation.localKey, expected: 'string' });
				}
				if (!('localField' in relation)) {
					relation.localField = utils.camelCase(relationModelName);
				}
				if (!('localKey' in relation)) {
					relation.localKey = utils.camelCase(relationModelName) + 'Id';
				}
				models[modelName].relations.indices[relation.localKey] = models[modelName].relations.indices[relation.localKey] || null;
			});

			utils.forOwn(model.relations.hasMany, function (relation, relationModelName) {
				if (!utils.isObject(relation)) {
					throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.' + relationModelName + ': Must be an object!', { actual: typeof relation, expected: 'object' });
				} else if ('localField' in relation && !utils.isString(relation.localField)) {
					throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.hasMany.' + relationModelName + '.localField: Must be a string!', { actual: typeof relation.localField, expected: 'string' });
				} else if ('foreignKey' in relation && !utils.isString(relation.foreignKey)) {
					throw new errors.IllegalArgumentError(errorPrefix + modelName + '.relations.hasMany.' + relationModelName + '.foreignKey: Must be a string!', { actual: typeof relation.foreignKey, expected: 'string' });
				}
				if (!('localField' in relation)) {
					relation.localField = utils.camelCase(relationModelName) + 'List';
				}
				if (!('foreignKey' in relation)) {
					relation.foreignKey = utils.camelCase(relationModelName) + 'Id';
				}
				if (models[relationModelName] && !models[relationModelName].relations.indices[relation.foreignKey]) {
					models[relationModelName].relations.indices[relation.foreignKey] = null;
				}
			});

			utils.forOwn(model.relations.indices, function (relationModelName, index) {
				if (!model.relations.indices[index]) {
					(function (m, i) {
						m.relations.indices[i] = m.tableReady
							.then(function () {
								return m.connection.run(r.table(m.tableName).indexList());
							})
							.then(function (indexList) {
								if (!utils.contains(indexList, i)) {
									return m.connection.run(r.table(m.tableName).indexCreate(i));
								}
							})
							.catch(console.error)
							.error(console.error);
					})(model, index);
				}
			});
		});
	}

	/**
	 * @doc property
	 * @id reheat.properties:Connection
	 * @name Connection
	 */
	reheat.Connection = Connection;

	reheat.getConnection = function (options, cb) {
		return Promise.resolve()
			.then(function () {
				return rethinkdbdash(options);
			})
			.tap(function (r) {
				return r.branch(r.dbList().contains(options.db), null, r.dbCreate(options.db)).run();
			})
			.done()
			.nodeify(cb);
	};

	/**
	 * @doc interface
	 * @id reheat.properties:support
	 * @name support
	 */
	reheat.support = {
		/**
		 * @doc property
		 * @id reheat.properties:support.UnhandledError
		 * @name UnhandledError
		 * @propertyOf reheat.properties:support
		 * @description
		 * See [UnhandledError](/documentation/api/api/support.error_types:UnhandledError).
		 */
		UnhandledError: errors.UnhandledError,

		/**
		 * @doc property
		 * @id reheat.properties:support.IllegalArgumentError
		 * @name IllegalArgumentError
		 * @propertyOf reheat.properties:support
		 * @description
		 * See [IllegalArgumentError](/documentation/api/api/support.error_types:IllegalArgumentError).
		 */
		IllegalArgumentError: errors.IllegalArgumentError,

		/**
		 * @doc property
		 * @id reheat.properties:support.RuntimeError
		 * @name RuntimeError
		 * @propertyOf reheat.properties:support
		 * @description
		 * See [RuntimeError](/documentation/api/api/support.error_types:RuntimeError).
		 */
		RuntimeError: errors.RuntimeError,

		/**
		 * @doc property
		 * @id reheat.properties:support.ValidationError
		 * @name ValidationError
		 * @propertyOf reheat.properties:support
		 * @description
		 * See [ValidationError](/documentation/api/api/support.error_types:ValidationError).
		 */
		ValidationError: errors.ValidationError
	};

	/**
	 * @doc method
	 * @id reheat.methods:defineModel
	 * @name defineModel
	 * @description
	 * Register a new Model with reheat.
	 *
	 * ## Signature:
	 * ```js
	 * reheat.defineModel(name[, staticProperties][, prototypeProperties])
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
	 * @param {string} name The name of the new model.
	 * @param {object} staticProps Properties and methods to be added as static properties of the child class. See
	 * Model for static properties and methods. Static methods should not be overridden. Some static properties
	 * have defaults, others are required to be set by the developer, like `Model.connection`. You can add any
	 * static properties and methods you want as long as they don't conflict with already existing static properties and
	 * methods. Properties:
	 *
	 * - `{string="test"}`  - tableName - The name of the table this model should map to.
	 * - `{string="id"}`    - idAttribute - The field that specifies the primary key for instances of this model.
	 * - `{boolean=false}`  - softDelete - Whether to add a `deleted` timestamp field to rows instead of deleting them.
	 * - `{boolean=false}`  - timestamps - Whether reheat should manage timestamps for instances of this model.
	 * - `{Connection}`     - connection - Instance of `reheat.Connection` this model should use.
	 * - `{Schema=}`        - schema - Schema this model should use.
	 *
	 * @param {object=} protoProps Properties and methods to be added to the prototype of the child class. See
	 * Model for default prototype properties and methods. Prototype properties and methods can be overridden for
	 * custom behavior. Properties:
	 *
	 * - `{function=}` - `beforeValidate(cb)`
	 * - `{function=}` - `validate(cb)`
	 * - `{function=}` - `afterValidate(cb)`
	 * - `{function=}` - `beforeCreate(cb)`
	 * - `{function=}` - `afterCreate(instance, cb)`
	 * - `{function=}` - `beforeUpdate(cb)`
	 * - `{function=}` - `afterUpdate(instance, cb)`
	 * - `{function=}` - `beforeDestroy(cb)`
	 * - `{function=}` - `afterDestroy(instance, cb)`
	 *
	 * @returns {Model} model The newly registered Model.
	 */
	reheat.defineModel = function (name, staticProps, protoProps) {
		if (!utils.isString(name)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'name: Must be a string!', { name: { actual: typeof name, expected: 'string' } });
		} else if (models[name]) {
			throw new errors.RuntimeError(errorPrefix + 'name: A Model with that name already exists!');
		} else if ('idAttribute' in staticProps && !utils.isString(staticProps.idAttribute)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.idAttribute: Must be a string!', { idAttribute: { actual: typeof staticProps.idAttribute, expected: 'string' } });
		} else if ('tableName' in staticProps && !utils.isString(staticProps.tableName)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.tableName: Must be a string!', { tableName: { actual: typeof staticProps.tableName, expected: 'string' } });
		} else if ('timestamps' in staticProps && !utils.isBoolean(staticProps.timestamps)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.timestamps: Must be a boolean!', { timestamps: { actual: typeof staticProps.timestamps, expected: 'string' } });
		} else if ('softDelete' in staticProps && !utils.isBoolean(staticProps.softDelete)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.softDelete: Must be a boolean!', { softDelete: { actual: typeof staticProps.softDelete, expected: 'string' } });
		} else if (!(staticProps.connection instanceof Connection)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.connection: Must be an instance of Connection!', { connection: { actual: typeof staticProps.connection, expected: 'Connection' } });
		} else if ('schema' in staticProps && staticProps.schema && !utils.isObject(staticProps.schema)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.schema: Must be an object!', { schema: { actual: typeof staticProps.schema, expected: 'object' } });
		} else if ('schema' in staticProps && staticProps.schema && !utils.isFunction(staticProps.schema.validate)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.schema.validate: Must be a function!', { schema: { validate: { actual: typeof staticProps.schema.validate, expected: 'function' } } });
		} else if ('relations' in staticProps && !utils.isObject(staticProps.relations)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'staticProps.relations: Must be an object!', { relations: { actual: typeof staticProps.relations, expected: 'object' } });
		} else {
			// Infer default tableName from model name
			if (!('tableName' in staticProps)) {
				staticProps.tableName = utils.lowerCase(name);
			}

			// Ensure table exists
			var deferred = Promise.defer();
			staticProps.tableReady = deferred.promise;
			staticProps.connection.run(r.tableList())
				.then(function (tableList) {
					if (!utils.contains(tableList, staticProps.tableName) && !staticProps.tableReady.isResolved()) {
						return staticProps.connection.run(r.tableCreate(staticProps.tableName))
							.then(function () {
								deferred.resolve();
							});
					} else {
						deferred.resolve();
					}
				})
				.catch(deferred.reject)
				.error(deferred.reject);

			staticProps.relations = staticProps.relations || {};
			staticProps.relations.indices = staticProps.relations.indices || {};
			staticProps.modelName = name;
			models[name] = extend.apply(Model, [protoProps, staticProps]);

			try {
				evaluateRelations();
			} catch (err) {
				delete models[name];
				throw err;
			}

			models[name].collection = extend.apply(Collection, [
				{},
				{
					model: Model,
					collectionName: Model.modelName + 'Collection'
				}
			]);

			models[name].collection.model = models[name];

			return models[name];
		}
	};

	/**
	 * @doc method
	 * @id reheat.methods:unregisterModel
	 * @name unregisterModel
	 * @description
	 * Unregister the model with the given name from reheat's registry.
	 *
	 * ## Signature:
	 * ```js
	 * reheat.unregisterModel(name)
	 * ```
	 *
	 * @param {string} name The name of the model to unregister.
	 */
	reheat.unregisterModel = function (name) {
		if (models[name] && models[name].collection) {
			models[name].collection.model = null;
			delete collections[models[name].collection.collectionName];
			models[name].collection = null;
		}
		delete models[name];
	};

	/**
	 * @doc method
	 * @id reheat.methods:defineCollection
	 * @name defineCollection
	 * @description
	 * Register a new Collection with reheat. This is optional. A default collection will be created for every model you define.
	 *
	 * ## Signature:
	 * ```js
	 * reheat.defineCollection(name[, staticProperties][, prototypeProperties])
	 * ```
	 *
	 * ## Example:
	 *
	 * ```js
	 *  var reheat = require('reheat'),
	 *      Post = require('../models/Post');
	 *
	 *  var Post = reheat.defineCollection('Posts, {
	 *      model: Post
	 *  }, {
	 *      something: function(cb) {
	 *          console.log('something');
	 *          cb();
	 *      }
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
	 * @param {string} name The name of the new collection.
	 * @param {object} staticProps Properties and methods to be added as static properties of the child class. See
	 * Collection for static properties and methods. Static methods should not be overridden. Some static properties
	 * have defaults, others are required to be set by the developer, like `Collection.model`. You can add any
	 * static properties and methods you want as long as they don't conflict with already existing static properties and
	 * methods. Properties:
	 *
	 * - `{string="test"}`  - model - The Model of this Collection.
	 *
	 * @param {object=} protoProps Properties and methods to be added to the prototype of the child class. See
	 * Collection for default prototype properties and methods. Prototype properties and methods can be overridden for
	 * custom behavior. Properties:
	 *
	 * - `{function=}` - `something(cb)`
	 *
	 * @returns {Collection} collection The newly registered Collection.
	 */
	reheat.defineCollection = function (name, staticProps, protoProps) {
		if (!utils.isString(name)) {
			throw new errors.IllegalArgumentError(errorPrefix2 + 'name: Must be a string!', { name: { actual: typeof name, expected: 'string' } });
		} else if (collections[name]) {
			throw new errors.RuntimeError(errorPrefix2 + 'name: A Collection with that name already exists!');
		} else if (!staticProps.model.__reheat_super__) {
			throw new errors.IllegalArgumentError(errorPrefix2 + 'staticProps.model: Must be a subclass of Model!', { model: { actual: typeof staticProps.model, expected: 'subclass of Model' } });
		} else {
			staticProps.collectionName = name;
			collections[name] = extend.apply(Collection, [protoProps, staticProps]);
			collections[name].model.collection = collections[name];

			return collections[name];
		}
	};

	/**
	 * @doc method
	 * @id reheat.methods:unregisterModel
	 * @name unregisterModel
	 * @description
	 * Unregister the model with the given name from reheat's registry.
	 *
	 * ## Signature:
	 * ```js
	 * reheat.unregisterCollection(name)
	 * ```
	 *
	 * @param {string} name The name of the model to unregister.
	 */
	reheat.unregisterCollection = function (name) {
		if (collections[name]) {
			collections[name].model.collection = extend.apply(Collection, [
				{},
				{
					model: collections[name].model,
					collectionName: collections[name].model.modelName + 'Collection'
				}
			]);
		}
		delete collections[name];
	};

	/**
	 * @doc method
	 * @id reheat.methods:getModel
	 * @name getModel
	 * @description
	 * Retrieve the model with the given name from reheat's registry.
	 *
	 * ## Signature:
	 * ```js
	 * reheat.getModel(name)
	 * ```
	 *
	 * @param {string} name The name of the model to retrieve.
	 * @returns {object} The model with the given name;
	 */
	reheat.getModel = function (name) {
		return models[name];
	};

	/**
	 * @doc method
	 * @id reheat.methods:getCollection
	 * @name getCollection
	 * @description
	 * Retrieve the collection with the given name from reheat's registry.
	 *
	 * ## Signature:
	 * ```js
	 * reheat.getCollection(name)
	 * ```
	 *
	 * @param {string} name The name of the collection to retrieve.
	 * @returns {object} The collection with the given name;
	 */
	reheat.getCollection = function (name) {
		return collections[name];
	};

	/**
	 * @doc method
	 * @id reheat.methods:availableDataTypes
	 * @name availableDataTypes
	 * @description
	 * See [robocop.availableDataTypes](http://jmdobry.github.io/robocop.js/api.html#robocopavailabledatatypes).
	 */
	/**
	 * @doc method
	 * @id reheat.methods:availableRules
	 * @name availableRules
	 * @description
	 * See [robocop.availableRules](http://jmdobry.github.io/robocop.js/api.html#robocopavailablerules).
	 */
	/**
	 * @doc method
	 * @id reheat.methods:availableSchemas
	 * @name availableSchemas
	 * @description
	 * See [robocop.availableSchemas](http://jmdobry.github.io/robocop.js/api.html#robocopavailableschemas).
	 */
	/**
	 * @doc method
	 * @id reheat.methods:defineDataType
	 * @name defineDataType
	 * @description
	 * See [robocop.defineDataType](http://jmdobry.github.io/robocop.js/api.html#robocopdefinedatatype).
	 */
	/**
	 * @doc method
	 * @id reheat.methods:defineRule
	 * @name defineRule
	 * @description
	 * See [robocop.defineRule](http://jmdobry.github.io/robocop.js/api.html#robocopdefinerule).
	 */
	/**
	 * @doc method
	 * @id reheat.methods:defineSchema
	 * @name defineSchema
	 * @description
	 * See [robocop.defineSchema](http://jmdobry.github.io/robocop.js/api.html#robocopdefineschema).
	 */
	/**
	 * @doc method
	 * @id reheat.methods:getDataType
	 * @name getDataType
	 * @description
	 * See [robocop.getDataType](http://jmdobry.github.io/robocop.js/api.html#robocopgetdatatype).
	 */
	/**
	 * @doc method
	 * @id reheat.methods:getRule
	 * @name getRule
	 * @description
	 * See [robocop.getRule](http://jmdobry.github.io/robocop.js/api.html#robocopgetrule).
	 */
	/**
	 * @doc method
	 * @id reheat.methods:getSchema
	 * @name getSchema
	 * @description
	 * See [robocop.getSchema](http://jmdobry.github.io/robocop.js/api.html#robocopgetschema).
	 */
	/**
	 * @doc method
	 * @id reheat.methods:removeDataType
	 * @name removeDataType
	 * @description
	 * See [robocop.removeDataType](http://jmdobry.github.io/robocop.js/api.html#robocopremovedatatype).
	 */
	/**
	 * @doc method
	 * @id reheat.methods:removeRule
	 * @name removeRule
	 * @description
	 * See [robocop.removeRule](http://jmdobry.github.io/robocop.js/api.html#robocopremoverule).
	 */
	/**
	 * @doc method
	 * @id reheat.methods:removeSchema
	 * @name removeSchema
	 * @description
	 * See [robocop.removeSchema](http://jmdobry.github.io/robocop.js/api.html#robocopremoveschema).
	 */
	utils.deepMixIn(reheat, robocop);

	delete reheat.Schema;

	// Freeze the API
	utils.deepFreeze(reheat);
});
