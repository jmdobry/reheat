module.exports = function (container, Promise, utils, errors) {
  var IllegalArgumentError = errors.IllegalArgumentError;
  var RuntimeError = errors.RuntimeError;
  var errorPrefix = 'Model.load(relations[, options][, cb]): ';

  /**
   * @doc method
   * @id Model.instance_methods:load
   * @name load
   * @description
   * Load the specified relations of this model instance.
   *
   * ## Signature:
   * ```js
   * Model#load(relations[, options][, cb])
   * ```
   *
   * ## Examples:
   *
   * ### Promise-style:
   * ```js
   *  post.load('Comment').then(function (post) {
	 *      post.get('comments'); // [...]
	 *  });
   *
   *  post.load(['Comment', 'User']).then(function (post) {
	 *      post.get('comments'); // [...]
	 *      post.get('user'); // {...}
	 *  });
   * ```
   *
   * ### Node-style:
   * ```js
   *  post.load('Comment', function (err, post) {
	 *      if (err) {
	 *          // handle error
	 *      } else {
	 *         post.get('comments'); // [...]
	 *      }
	 *  });
   * ```
   *
   * ## Throws/Rejects with:
   *
   * - `{IllegalArgumentError}`
   * - `{UnhandledError}`
   *
   * @param {string|array} relations The names of the Models of the relations to load.
   * @param {object=} options Optional configuration. Properties:
   *
   * - `{boolean=false}` - `profile` - If `true` the query profile will be appended to `instance.queries`.
   *
   * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
   *
   * - `{IllegalArgumentError|UnhandledError}` - `err` - `null` if no error occurs.
   * - `{object}` - `instance` - If no error occurs, this model instance, with relations loaded.
   * @returns {Promise} Promise.
   */
  function load(relations, options, cb) {
    var models = container.get('models');
    var Model = this.constructor;
    var newModels = {};
    var merge = {};
    var query;

    if (utils.isFunction(options)) {
      cb = options;
      options = {};
    }
    options = options || {};
    if (utils.isString(relations)) {
      relations = [relations];
    }
    if (cb && !utils.isFunction(cb)) {
      throw new IllegalArgumentError(errorPrefix + 'cb: Must be a function!', { actual: typeof cb, expected: 'function' });
    }
    return Promise.resolve().bind(this)
      .then(function () {
        if (!utils.isString(relations) && !utils.isArray(relations)) {
          throw new IllegalArgumentError(errorPrefix + 'relations: Must be a string or an array!', { actual: typeof relations, expected: 'string' });
        } else if (!utils.isObject(options)) {
          throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
        }
      })
      .then(function () {

        if (Model.relations.belongsTo) {
          utils.forOwn(Model.relations.belongsTo, function (relation, modelName) {
            if (!models[modelName]) {
              throw new RuntimeError(Model.name + ' Model defined belongsTo relationship to nonexistent ' + modelName + ' Model!');
            } else if (utils.contains(relations, modelName)) {
              var localField = relation.localField;
              var localKey = relation.localKey;

              merge[localField] = Model.r.table(models[modelName].tableName).get(this.get(localKey) || '');

              newModels[localField] = {
                modelName: modelName,
                relation: 'belongsTo'
              };
            }
          }, this);
        }

        if (Model.relations.hasMany) {
          utils.forOwn(Model.relations.hasMany, function (relation, modelName) {
            if (!models[modelName]) {
              throw new RuntimeError(Model.name + ' Model defined hasMany relationship to nonexistent ' + modelName + ' Model!');
            } else if (utils.contains(relations, modelName)) {
              var localField = relation.localField;
              var foreignKey = relation.foreignKey;

              merge[localField] = Model.r.table(models[modelName].tableName).getAll(this.get(Model.idAttribute) || '', { index: foreignKey }).coerceTo('ARRAY');

              newModels[localField] = {
                modelName: modelName,
                relation: 'hasMany'
              };
            }
          }, this);
        }

        if (Model.relations.hasOne) {
          utils.forOwn(Model.relations.hasOne, function (relation, modelName) {
            if (!models[modelName]) {
              throw new RuntimeError(Model.name + ' Model defined hasOne relationship to nonexistent ' + modelName + ' Model!');
            } else if (utils.contains(relations, modelName)) {
              var localField = relation.localField;

              merge[localField] = Model.r.table(models[modelName].tableName);

              if (relation.localKey) {
                merge[localField] = merge[localField].get(relation.localKey);
              } else {
                var foreignKey = relation.foreignKey;
                merge[localField] = merge[localField].getAll(this.get(Model.idAttribute) || '', { index: foreignKey }).coerceTo('ARRAY');
              }

              newModels[localField] = {
                modelName: modelName,
                relation: 'hasOne'
              };
            }
          }, this);
        }

        query = Model.r.expr({}).merge(merge);

        if (Model.tableReady && Model.tableReady !== true) {
          return Model.tableReady;
        }
      })
      .then(function () {
        if (!utils.isEmpty(merge)) {
          return Model.connection.run(Model.r.table(Model.tableName).indexWait());
        } else {
          return null;
        }
      })
      .then(function () {
        return Model.connection.run(query, options);
      })
      .then(function (document) {
        var doc = document;
        if (options.profile) {
          doc = document.result;
        }
        if (!doc) {
          return null;
        } else {
          utils.forOwn(doc, function (localValue, localKey) {
            if (localKey in newModels) {
              if (utils.isObject(localValue)) {
                doc[localKey] = new models[newModels[localKey].modelName](doc[localKey]);
              } else if (utils.isArray(localValue)) {
                if (newModels[localKey].relation === 'hasOne' && localValue.length) {
                  doc[localKey] = new models[newModels[localKey].modelName](localValue[0]);
                } else {
                  doc[localKey] = new models[newModels[localKey].modelName].collection(localValue);
                }
              }
            }
          });

          this.setSync(doc);
          if (options.profile) {
            this.queries = this.queries || [];
            this.queries.push(document.profile);
          }
          return this;
        }
      })
      .finally(function () {
        models = newModels = merge = query = null;
      }).nodeify(cb);
  }

  return load;
}
;
