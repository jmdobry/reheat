var errorPrefix = 'Model.destroyOne(primaryKey[, options][, cb]): ';

module.exports = function (container, Promise, utils, errors) {
  /**
   * @doc method
   * @id Model.static_methods:destroyOne
   * @name destroyOne
   * @description
   * Delete a single row by primary key from this Model's table. The `with` option allows one to cascade delete hasOne
   * and hasMany relationships one level deep efficiently. Does not activate model lifecycle hooks.
   *
   * ## Signature:
   * ```js
   * Model.destroyOne(primaryKey[, options][, cb])
   * ```
   *
   * ## Examples:
   *
   * ### Promise-style:
   * ```js
   *  Post.destroyOne('325d2b12-e412-4e0e-be28-c87173f45374').then(function (result) {
	 *      result.deleted; // 1
	 *  });
   *
   *  // or
   *
   *  Post.destroyOne('325d2b12-e412-4e0e-be28-c87173f45374', { with: ['Comment'] })
   *      .then(function (result) {
	 *          result.deleted; // 1
	 *      });
   * ```
   *
   * ### Node-style:
   * ```js
   *  Post.get('325d2b12-e412-4e0e-be28-c87173f45374', function (err, result) {
	 *      result.deleted; // 1
	 *  });
   * ```
   *
   * ## Throws/Rejects with:
   *
   * - `{IllegalArgumentError}`
   * - `{UnhandledError}`
   *
   * @param {string} primaryKey The primary key of the document to retrieve.
   * @param {object=} options Optional configuration. Properties:
   *
   * - `{boolean=false}` - `raw` - If `true`, return the raw data instead of an instance of Model.
   * - `{boolean=false}` - `profile` - If `true` the query profile will be appended to `instance.queries`.
   * - `{array=[]}` - `with` - Array of strings corresponding to the Model names of hasOne and hasMany relations that
   * should also be destroyed.
   *
   * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, result)`. Arguments:
   *
   * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
   * - `{object}` - `result` - If no error occurs, the result of the query.
   * @returns {Promise} Promise.
   */
  function destroyOne(primaryKey, options, cb) {
    var models = container.get('models');
    var query;
    var Model = this;

    if (utils.isFunction(options)) {
      cb = options;
      options = {};
    }
    options = options || {};
    if (cb && !utils.isFunction(cb)) {
      throw new errors.IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
    }
    return Promise.resolve().bind(this)
      .then(function () {
        if (!utils.isString(primaryKey)) {
          throw new errors.IllegalArgumentError(errorPrefix + 'primaryKey: Must be a string!', { actual: typeof primaryKey, expected: 'string' });
        } else if (!utils.isObject(options)) {
          throw new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
        } else if (options.with && !utils.isArray(options.with)) {
          throw new errors.IllegalArgumentError(errorPrefix + 'options.with: Must be an array!', { actual: typeof options.with, expected: 'array' });
        }

        query = Model.r.do(Model.r.table(this.tableName).get(primaryKey), function () {
          var subQuery;

          if (Model.softDelete) {
            var attrs = { deleted: Model.r.now() };
            if (Model.timestamps) {
              attrs.updated = Model.r.now();
            }
            subQuery = Model.r.table(Model.tableName).get(primaryKey).update(attrs);
          } else {
            subQuery = Model.r.table(Model.tableName).get(primaryKey).delete();
          }
          if (options.with) {
            if (Model.relations.hasMany) {
              utils.forOwn(Model.relations.hasMany, function (relation, modelName) {
                if (!models[modelName]) {
                  throw new errors.RuntimeError(Model.name + ' Model defined hasMany relationship to nonexistent ' + modelName + ' Model!');
                } else if (utils.contains(options.with, modelName)) {
                  if (models[modelName].softDelete) {
                    var attrs = { deleted: Model.r.now() };
                    if (models[modelName].timestamps) {
                      attrs.updated = Model.r.now();
                    }
                    subQuery = Model.r.table(models[modelName].tableName).getAll(primaryKey, { index: relation.foreignKey }).update(attrs).and(subQuery);
                  } else {
                    subQuery = Model.r.table(models[modelName].tableName).getAll(primaryKey, { index: relation.foreignKey }).delete().and(subQuery);
                  }
                }
              });
            }
            if (Model.relations.hasOne) {
              utils.forOwn(Model.relations.hasOne, function (relation, modelName) {
                if (!models[modelName]) {
                  throw new errors.RuntimeError(Model.name + ' Model defined hasOne relationship to nonexistent ' + modelName + ' Model!');
                } else if (utils.contains(options.with, modelName)) {
                  if (models[modelName].softDelete) {
                    var attrs = { deleted: Model.r.now() };
                    if (models[modelName].timestamps) {
                      attrs.updated = Model.r.now();
                    }
                    subQuery = Model.r.table(models[modelName].tableName).getAll(primaryKey, { index: relation.foreignKey }).update(attrs).and(subQuery);
                  } else {
                    subQuery = Model.r.table(models[modelName].tableName).getAll(primaryKey, { index: relation.foreignKey }).delete().and(subQuery);
                  }
                }
              });
            }
          }
          return subQuery;
        });

        if (this.tableReady && this.tableReady !== true) {
          return this.tableReady;
        }
      })
      .then(function () {
        return Model.connection.run(query, options);
      })
      .finally(function () {
        models = query = Model = null;
      }).nodeify(cb);
  }

  return destroyOne;
};
