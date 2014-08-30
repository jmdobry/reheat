var errorPrefix = 'Model#save([options], cb): ';

module.exports = function (Promise, utils, errors, models) {
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
   * ## Throws/Rejects with:
   *
   * - `{ValidationError}`
   * - `{IllegalArgumentError}`
   * - `{UnhandledError}`
   *
   * @param {object=} options Optional configuration options. Properties:
   *
   * - `{boolean=false}` - `deepSave` - If `true`, call `save()` on any hasOne or hasMany relations currently
   * loaded into this model instance. Will attempt to set the proper foreign keys.
   *
   * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
   *
   * - `{ValidationError|UnhandledError}` - `err` - `null` if no error occurs.
   * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `save([options][, cb])` was called.
   * @returns {Promise} Promise.
   */
  function save(options, cb) {
    var relationsToMerge = {};
    var childRelations = {};
    var Model = this.constructor;

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
        if (!utils.isObject(options)) {
          throw new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
        }
      })
      .then(function () {
        if (Model.relations.belongsTo) {
          utils.forOwn(Model.relations.belongsTo, function (relation, modelName) {
            if (!models[modelName]) {
              throw new errors.RuntimeError(Model.name + ' Model defined belongsTo relationship to nonexistent ' + modelName + ' Model!');
            }

            var parent = this.get(relation.localField);

            if (parent) {
              relationsToMerge[relation.localField] = parent;
              utils.unset(this.attributes, relation.localField);
              console.warn('Cascade saving not supported yet! Failing to save "' + relation.localField + '". You must save it yourself!');
            }
          }, this);
        }

        if (Model.relations.hasMany) {
          utils.forOwn(Model.relations.hasMany, function (relation, modelName) {
            if (!models[modelName]) {
              throw new errors.RuntimeError(Model.name + ' Model defined hasMany relationship to nonexistent ' + modelName + ' Model!');
            }

            var children = this.get(relation.localField);

            if (children) {
              childRelations[relation.localField] = {
                value: children,
                isCollection: true,
                localField: relation.localField,
                foreignKey: relation.foreignKey
              };
              relationsToMerge[relation.localField] = children;
              utils.unset(this.attributes, relation.localField);
            }
          }, this);
        }

        if (Model.relations.hasOne) {
          utils.forOwn(Model.relations.hasOne, function (relation, modelName) {
            if (!models[modelName]) {
              throw new errors.RuntimeError(Model.name + ' Model defined hasOne relationship to nonexistent ' + modelName + ' Model!');
            }

            var sibling = this.get(relation.localField);

            if (sibling) {
              childRelations[relation.localField] = {
                value: sibling,
                localField: relation.localField,
                foreignKey: relation.foreignKey
              };
              relationsToMerge[relation.localField] = sibling;
              utils.unset(this.attributes, relation.localField);
            }
          }, this);
        }

        if (this.isNew() && Model.schema && Model.schema.defaults) {
          Model.schema.addDefaultsToTarget(this.attributes);
        }

        options.validate = 'validate' in options ? options.validate : true;

        if (options.validate) {
          return Promise.promisify(this.beforeValidate, this)().bind(this)
            .then(function () {
              return Promise.promisify(this.validate, this)().bind(this);
            })
            .then(function () {
              return Promise.promisify(this.afterValidate, this)().bind(this);
            });
        }
      })
      .then(function () {
        return this.isNew() ? Promise.promisify(this.beforeCreate, this)().bind(this).return(Model) : Promise.promisify(this.beforeUpdate, this)().bind(this).return(Model);
      })
      .then(function (Model) {
        if (Model.tableReady && Model.tableReady !== true) {
          return Model.tableReady.return(Model);
        } else {
          return Model;
        }
      })
      .then(function (Model) {
        if (Model.timestamps) {
          if (this.isNew()) {
            utils.deepMixIn(this.attributes, { deleted: null, updated: Model.r.now(), created: Model.r.now() });
          } else {
            utils.deepMixIn(this.attributes, { updated: Model.r.now() });
          }
        }
        if (this.isNew()) {
          return Model.connection.run(Model.r.table(Model.tableName).insert(this.attributes, { returnChanges: true }));
        } else {
          return Model.connection.run(Model.r.table(Model.tableName).get(this.get(Model.idAttribute)).update(this.attributes, { returnChanges: true }));
        }
      })
      .then(function (cursor) {
        if (cursor.errors !== 0) {
          throw new Error(cursor.first_error);
        } else {
          this.previousAttributes = utils.merge({}, cursor.changes[0].old_val);
          this.meta = utils.merge({}, cursor);
          utils.deepMixIn(this.attributes, utils.merge({}, cursor.changes[0].new_val));
          utils.deepMixIn(this.attributes, relationsToMerge);

          var tasks = [];

          if (options.deepSave) {
            utils.forOwn(childRelations, function (child) {
              if (child.isCollection) {
                child.value.forEach(function (item) {
                  item.setSync(child.foreignKey, this.get(Model.idAttribute));
                }, this);
              } else {
                child.value.setSync(child.foreignKey, this.get(Model.idAttribute));
              }
              tasks.push(child.value.save(options));
            }, this);
          }

          if (tasks.length) {
            return Promise.all(tasks);
          }
        }
      })
      .then(function () {
        return this.meta.inserted ? Promise.promisify(this.afterCreate, this)(this) : Promise.promisify(this.afterUpdate, this)(this);
      })
      .finally(function () {
        relationsToMerge = null;
        childRelations = {};
      }).nodeify(cb);
  }

  return save;
};

