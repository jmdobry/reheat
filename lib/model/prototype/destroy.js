var errorPrefix = 'Model#destroy([options][, cb]): ';

module.exports = function (r, Promise, utils, errors, models) {
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
		var tasks = [];
		if (utils.isFunction(options)) {
			cb = options;
			options = {};
		}
		options = options || {};
		if (cb && !utils.isFunction(cb)) {
			throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
		}
		function checkRelation(relation, modelName) {
			if (!models[modelName]) {
				throw new errors.RuntimeError(errorPrefix + this.constructor.name + ' Model defined hasOne or hasMany relationship to nonexistent ' + modelName + ' Model!');
			}

			if (this.get(relation.localField)) {
				tasks.push(this.get(relation.localField).destroy());
			}
		}

		return Promise.resolve().bind(this)
			.then(function () {
				if (!utils.isObject(options)) {
					throw new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
				}

				if (options.deepDestroy) {
					if (this.constructor.relations.hasMany) {
						utils.forOwn(this.constructor.relations.hasMany, checkRelation, this);
					}

					if (this.constructor.relations.hasOne) {
						utils.forOwn(this.constructor.relations.hasOne, checkRelation, this);
					}
				}

				if (tasks.length) {
					return Promise.all(tasks);
				}
			})
			.then(function () {
				return Promise.promisify(this.beforeDestroy, this)().bind(this).return(this.constructor);
			})
			.then(function (Model) {
				if (Model.tableReady && Model.tableReady !== true) {
					return Model.tableReady.return(Model);
				} else {
					return Model;
				}
			})
			.then(function (Model) {
				if (Model.softDelete) {
					utils.deepMixIn(this.attributes, { deleted: r.now() });
					if (Model.timestamps) {
						utils.deepMixIn(this.attributes, { updated: r.now() });
					}
					return Model.connection.run(r.table(Model.tableName).get(this.get(Model.idAttribute) || '').update(this.attributes, { return_vals: true }), options);
				} else {
					return Model.connection.run(r.table(Model.tableName).get(this.get(Model.idAttribute) || '').delete(), options);
				}
			})
			.then(function (cursor) {
				if (cursor.errors !== 0) {
					throw new Error(cursor.first_error);
				} else {
					if (this.constructor.softDelete) {
						utils.deepMixIn(this.attributes, utils.merge({}, cursor.new_val));
					} else {
						utils.unset(this.attributes, this.constructor.idAttribute);
					}
					this.previousAttributes = utils.merge({}, cursor.old_val);
					this.meta = utils.merge({}, cursor);
					return Promise.promisify(this.afterDestroy, this)(this).bind(this);
				}
			}).finally(function () {
				tasks = null;
			}).nodeify(cb);
	}

	return destroy;
};

