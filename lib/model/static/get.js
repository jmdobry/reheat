var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	IllegalArgumentError = errors.IllegalArgumentError,
	RuntimeError = errors.RuntimeError,
	Promise = require('bluebird'),
	r = require('rethinkdb'),
	models = require('../../models'),
	errorPrefix = 'Model.get(primaryKey[, options], cb): ';

/**
 * @doc method
 * @id Model.static_methods:get
 * @name get
 * @description
 * Search the table specified by `Model.tableName` for the document with the given primary key. Return an instance of
 * this Model or the raw data if `options.raw === true`.
 *
 * See [r#get](http://rethinkdb.com/api/javascript/#get).
 *
 * ## Signature:
 * ```js
 * Model.get(primaryKey[, options][, cb])
 * ```
 *
 * ## Examples:
 *
 * ### Promise-style:
 * ```js
 *  Post.get('325d2b12-e412-4e0e-be28-c87173f45374').then(function (post) {
 *      if (post) {
 *          res.send(200, post.toJSON());
 *      } else {
 *          res.send(404);
 *      }
 *  })
 *  .catch(reheat.support.IllegalArgumentError, function (err) {
 *      res.send(400, err.errors);
 *  })
 *  .error(function (err) {
 *      res.send(500, 'Internal Server Error!');
 *  });
 * ```
 *
 * ### Node-style:
 * ```js
 *  Post.get('325d2b12-e412-4e0e-be28-c87173f45374', function (err, post) {
 *      if (err) {
 *          if (err instanceof reheat.support.IllegalArgumentError) {
 *              res.send(400, err.errors);
 *          } else {
 *              res.send(500, 'Internal Server Error!');
 *          }
 *      } else {
 *          if (post) {
 *              res.send(200, post.toJSON());
 *          } else {
 *              res.send(404);
 *          }
 *      }
 *  });
 * ```
 *
 * ## Throws/Rejects with
 *
 * - `{IllegalArgumentError}`
 * - `{UnhandledError}`
 *
 * @param {string} primaryKey The primary key of the document to retrieve.
 * @param {object=} options Optional configuration. Properties:
 *
 * - `{boolean=false}` - `raw` - If `true`, return the raw data instead of an instance of Model.
 * - `{boolean=false}` - `profile` - If `true`, write query profile to stdout.
 *
 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
 *
 * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
 * - `{object}` - `instances` - If no error occurs, instances of this Model.
 * @returns {Promise} Promise.
 */
module.exports = function get(primaryKey, options, cb) {
	var Model = this;

	options = options || {};

	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	}

	if (cb && !utils.isFunction(cb)) {
		throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	}

	return Promise.resolve().then(function () {

		if (!utils.isString(primaryKey)) {
			throw new IllegalArgumentError(errorPrefix + 'primaryKey: Must be a string!', { actual: typeof primaryKey, expected: 'string' });
		} else if (!utils.isObject(options)) {
			throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
		} else if (options.with && !utils.isArray(options.with)) {
			throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
		}

		var newModels = {},
			query = r.do(r.table(Model.tableName).get(primaryKey), function (doc) {
				if (options.with) {
					var merge = {};
					if (Model.relations.belongsTo) {
						utils.forOwn(Model.relations.belongsTo, function (relation, modelName) {
							if (!models[modelName]) {
								throw new RuntimeError(Model.name + ' Model defined belongsTo relationship to nonexistent ' + modelName + ' Model!');
							} else if (utils.contains(options.with, modelName)) {
								var localField = relation.localField || utils.camelCase(modelName),
									localKey = relation.localKey || utils.camelCase(Model.name) + 'Id';

								console.log(localField, modelName, models[modelName].tableName, localKey);
								merge[localField] = r.table(models[modelName].tableName).get(doc(localKey));

								newModels[localField] = {
									modelName: modelName,
									relation: 'belongsTo'
								};
							}
						});
					}

					if (Model.relations.hasMany) {
						utils.forOwn(Model.relations.hasMany, function (relation, modelName) {
							if (!models[modelName]) {
								throw new RuntimeError(Model.name + ' Model defined hasMany relationship to nonexistent ' + modelName + ' Model!');
							} else if (utils.contains(options.with, modelName)) {
								var localField = relation.localField || utils.camelCase(modelName) + 'List',
									foreignKey = relation.foreignKey || utils.camelCase(Model.name) + 'Id';

								merge[localField] = r.table(models[modelName].tableName).getAll(primaryKey, { index: foreignKey }).coerceTo('ARRAY');

								newModels[localField] = {
									modelName: modelName,
									relation: 'hasMany'
								};
							}
						});
					}

					if (Model.relations.hasOne) {
						utils.forOwn(Model.relations.hasOne, function (relation, modelName) {
							if (!models[modelName]) {
								throw new RuntimeError(Model.name + ' Model defined hasOne relationship to nonexistent ' + modelName + ' Model!');
							} else if (utils.contains(options.with, modelName)) {
								var localField = relation.localField || utils.camelCase(modelName);

								merge[localField] = r.table(models[modelName].tableName);

								if (relation.localKey) {
									merge[localField] = merge[localField].get(relation.localKey);
								} else {
									var foreignKey = relation.foreignKey || utils.camelCase(modelName) + 'Id';
									merge[localField] = merge[localField].getAll(primaryKey, { index: foreignKey }).coerceTo('ARRAY');
								}

								newModels[localField] = {
									modelName: modelName,
									relation: 'hasOne'
								};
							}
						});
					}

					if (!utils.isEmpty(merge)) {
						return doc.merge(merge);
					}
				}
				return doc;
			});

		return Model.connection.run(query, options).then(function (document) {
			var doc = document;
			if (options.profile) {
				process.stdout.write(JSON.stringify(document.profile, null, 2) + '\n');
				doc = document.value;
			}
			if (!doc) {
				return null;
			} else {
				if (!options.raw) {
					utils.forOwn(doc, function (localValue, localKey) {
						if (localKey in newModels) {
							if (utils.isObject(localValue)) {
								doc[localKey] = new models[newModels[localKey].modelName](doc[localKey]);
							} else if (utils.isArray(localValue)) {
								if (newModels[localKey].relation === 'hasOne' && localValue.length) {
									doc[localKey] = new models[newModels[localKey].modelName](localValue[0]);
								} else {
									for (var i = 0; i < localValue.length; i++) {
										localValue[i] = new models[newModels[localKey].modelName](localValue[i]);
									}
								}
							} else {
								// TODO: Error
							}
						}
					});
					return new Model(doc);
				} else {
					return doc;
				}
			}
		});
	}).nodeify(cb);
};
