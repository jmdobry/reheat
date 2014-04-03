var errorPrefix = 'Model#destroy([options], cb): ';

module.exports = function (r, Promise, utils, errors, models) {
	var IllegalArgumentError = errors.IllegalArgumentError,
		RuntimeError = errors.RuntimeError,
		UnhandledError = errors.UnhandledError;

	/**
	 * @doc method
	 * @id Model.instance_methods:destroy
	 * @name destroy
	 * @description
	 * Destroy this instance. If the Model for this instance was configured with `softDelete: false`, then
	 * the row specified by this instance's primary key will be removed from the database. If the Model for this instance
	 * was configured with `softDelete: true`, then the row specified by the instance's primary key will be
	 * updated with a `deleted` property set to the UTC datetime (of the database) at which the operation occurs.
	 *
	 * ## Signature:
	 * ```js
	 * Model#destroy([options][, cb])
	 * ```
	 *
	 * ## Examples:
	 *
	 * ### Promise-style:
	 * ```js
	 *  post.destroy().then(function (post) {
	 *      res.send(204, post.get(post.constructor.idAttribute));
	 *  })
	 *  .error(function (err) {
	 *      res.send(500, err.message);
	 *  });
	 * ```
	 *
	 * ### Node-style:
	 * ```js
	 *  post.destroy(function (err, post) {
	 *      if (err) {
	 *          res.send(500, err.message);
	 *      } else {
	 *          res.send(204, post.get(post.constructor.idAttribute));
	 *      }
	 *  });
	 * ```
	 *
	 * ## Throws/Rejects with:
	 *
	 * - `{IllegalArgumentError}`
	 * - `{UnhandledError}`
	 *
	 * @param {object=} options Optional configuration options. Properties:
	 *
	 * - `{boolean=false}` - `deepDestroy` - If `true`, call `destroy()` on any hasOne or hasMany relations currently
	 * loaded into this model instance.
	 *
	 * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
	 *
	 * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
	 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `destroy([options][, cb])` was called.
	 * @returns {Promise} Promise.
	 */
	function destroy(options, cb) {
		var _this = this,
			Model = _this.constructor;

		options = options || {};

		if (utils.isFunction(options)) {
			cb = options;
			options = {};
		}

		if (cb && !utils.isFunction(cb)) {
			throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
		}

		var relationsToMerge = {};

		return Promise.resolve()
			.then(function () {
				if (!utils.isObject(options)) {
					throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
				}

				var tasks = [];

				if (options.deepDestroy) {
					if (Model.relations.hasMany) {
						utils.forOwn(Model.relations.hasMany, function (relation, modelName) {
							if (!models[modelName]) {
								throw new RuntimeError(Model.name + ' Model defined hasMany relationship to nonexistent ' + modelName + ' Model!');
							}

							var children = _this.get(relation.localField);

							if (children) {
								tasks.push(children.destroy());
							}
						});
					}

					if (Model.relations.hasOne) {
						utils.forOwn(Model.relations.hasOne, function (relation, modelName) {
							if (!models[modelName]) {
								throw new RuntimeError(Model.name + ' Model defined hasOne relationship to nonexistent ' + modelName + ' Model!');
							}

							var sibling = _this.get(relation.localField);

							if (sibling) {
								tasks.push(sibling.destroy());
							}
						});
					}
				}

				if (tasks.length) {
					return Promise.all(tasks).then(function () {
						return Promise.promisify(_this.beforeDestroy, _this)();
					});
				} else {
					return Promise.promisify(_this.beforeDestroy, _this)();
				}
			})
			.then(function () {
				if (_this.isNew()) {
					return _this;
				}

				var query = r.table(Model.tableName).get(_this.get(Model.idAttribute));

				if (Model.softDelete) {
					var attrs = { deleted: r.now() };
					if (Model.timestamps) {
						attrs.updated = r.now();
					}
					query = query.update(attrs, { return_vals: true });
				} else {
					query = query.delete({ return_vals: true });
				}

				return Model.tableReady.then(function () {
					return Model.connection.run(query, options);
				});
			})
			.then(function (cursor) {
				if (cursor === _this) {
					return Promise.promisify(_this.afterDestroy, _this)(_this);
				}
				if (cursor.errors !== 0) {
					throw new UnhandledError(new Error(cursor.first_error || 'delete failed'));
				} else {
					if (Model.softDelete) {
						utils.deepMixIn(_this.attributes, cursor.new_val);
					} else {
						delete _this.attributes[Model.idAttribute];
					}
					_this.previousAttributes = {};
					_this.meta = cursor;
					utils.deepMixIn(_this.previousAttributes, cursor.old_val);
					utils.deepMixIn(_this.attributes, relationsToMerge);
					return Promise.promisify(_this.afterDestroy, _this)(_this);
				}
			}).nodeify(cb);
	}

	return destroy;
};

