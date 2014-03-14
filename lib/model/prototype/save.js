var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	IllegalArgumentError = errors.IllegalArgumentError,
	RuntimeError = errors.RuntimeError,
	UnhandledError = errors.UnhandledError,
	Promise = require('bluebird'),
	r = require('rethinkdb'),
	models = require('../../models'),
	errorPrefix = 'Model#save([options], cb): ';

/**
 * @doc method
 * @id Model.instance_methods:save
 * @name save
 * @description
 * Save this instance to the database.
 *
 * If this instance is new (has not yet been saved to the database), then a new row will be inserted into the database
 * with the current attributes of this instance. If this instance's Model was configured with "timestamps: true"
 * (which is default), then the new row will also be set with a "created" and an "updated" property, set to the UTC
 * datetime (of the database) at which the operation occurs.
 *
 * If the instance isn't new (update operation), then the row specified by the primary key of the instance will be
 * updated with the current attributes of the instance. If the Model for the instance was configured with
 * "timestamps: true" (which is default), then the "updated" property of the row specified by the primary key of the
 * instance will be updated with the UTC datetime (of the database) at which the operation occurs.
 *
 * ## Signature:
 * ```js
 * Model#save([options][, cb])
 * ```
 *
 * ## Example:
 *
 * ### Promise-style:
 * ```js
 *  var post = new Post({
 *      author: 'John Anderson',
 *      title: 'How to cook'
 *  });
 *
 *  post.save().then(function (post) {
 *      res.send(201, post.toJSON());
 *  })
 *  .catch(reheat.support.ValidationError, function (err) {
 *      res.send(400, err.errors);
 *  })
 *  .error(function (err) {
 *      res.send(500, err.message);
 *  });
 * ```
 *
 * ### Node-style:
 * ```js
 *  var post = new Post({
 *      author: 'John Anderson',
 *      title: 'How to cook'
 *  });
 *
 *  post.save(function (err, post) {
 *      if (err) {
 *          if (err instanceof reheat.support.IllegalArgumentError || err instanceof reheat.support.ValidationError) {
 *              res.send(400, err.errors);
 *          } else {
 *              res.send(500, err.message);
 *          }
 *      } else {
 *          if (post) {
 *              res.send(201, post.toJSON());
 *          } else {
 *              res.send(404);
 *          }
 *      }
 *  });
 * ```
 *
 * ## Throws/Rejects with
 *
 * - `{ValidationError}`
 * - `{IllegalArgumentError}`
 * - `{UnhandledError}`
 *
 * @param {object=} options Optional configuration options.
 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
 *
 * - `{ValidationError|UnhandledError}` - `err` - `null` if no error occurs.
 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `save(cb)` was called.
 * @returns {Promise} Promise.
 */
module.exports = function save(options, cb) {
	var _this = this,
		Model = _this.constructor,
		query = r.table(Model.tableName);

	options = options || {};

	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	}
	if (cb && !utils.isFunction(cb)) {
		throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	}

	return Promise.resolve()
		.then(function () {
			if (Model.relations.hasMany) {
				utils.forOwn(Model.relations.hasMany, function (relation, modelName) {
					if (!models[modelName]) {
						throw new RuntimeError(Model.name + ' Model defined belongsTo relationship to nonexistent ' + modelName + ' Model!');
					}

					var localField = relation.localField || utils.camelCase(modelName) + 'List',
						children = _this.get(localField);

					if (children) {
						throw new RuntimeError('Cascade saving not supported yet! Failing to save "' + localField + '".');
					}
				});
			}

			if (Model.relations.hasOne) {
				utils.forOwn(Model.relations.hasOne, function (relation, modelName) {
					if (!models[modelName]) {
						throw new RuntimeError(Model.name + ' Model defined hasOne relationship to nonexistent ' + modelName + ' Model!');
					}

					var localField = relation.localField || utils.camelCase(modelName),
						sibling = _this.get(localField);

					if (sibling) {
						throw new RuntimeError('Cascade saving not supported yet! Failing to save "' + localField + '".');
					}
				});
			}

			if (!utils.isObject(options)) {
				throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
			}

			options.validate = 'validate' in options ? options.validate : true;

			if (options.validate) {
				return Promise.promisify(_this.beforeValidate, _this)()
					.then(function () {
						return Promise.promisify(_this.validate, _this)();
					})
					.then(function () {
						return Promise.promisify(_this.afterValidate, _this)();
					});
			} else {
				return Promise.resolve();
			}
		})
		.then(function () {
			var method = _this.isNew() ? _this.beforeCreate : _this.beforeUpdate;
			return Promise.promisify(method, _this)();
		})
		.then(function () {
			if (Model.timestamps) {
				if (_this.isNew()) {
					_this.attributes.created = r.now();
					_this.attributes.deleted = null;
				}
				_this.attributes.updated = r.now();
			}

			if (_this.isNew()) {
				query = query.insert(_this.attributes, { return_vals: true });
			} else {
				query = query.get(_this.get(Model.idAttribute)).update(_this.attributes, { return_vals: true });
			}

			return Model.connection.run(query, options);
		})
		.then(function (cursor) {
			if (cursor.errors !== 0) {
				throw new UnhandledError(new Error(cursor.first_error || 'insert failed'));
			} else {
				utils.deepMixIn(_this.previousAttributes, cursor.old_val);
				_this.meta = cursor;
				utils.deepMixIn(_this.attributes, cursor.new_val);
				var method = _this.meta.inserted ? _this.afterCreate : _this.afterUpdate;
				return Promise.promisify(method, _this)(_this);
			}
		}).nodeify(cb);
};
