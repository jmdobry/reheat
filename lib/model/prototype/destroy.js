var errorPrefix = 'Model#destroy([options][, cb]): ';

module.exports = function (Promise, utils, errors, models) {
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
    var Model = this.constructor;
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
        throw new errors.RuntimeError(errorPrefix + Model.name + ' Model defined hasOne or hasMany relationship to nonexistent ' + modelName + ' Model!');
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
          if (Model.relations.hasMany) {
            utils.forOwn(Model.relations.hasMany, checkRelation, this);
          }

          if (Model.relations.hasOne) {
            utils.forOwn(Model.relations.hasOne, checkRelation, this);
          }
        }

        if (tasks.length) {
          return Promise.all(tasks);
        }
      })
      .then(function () {
        if (!this.isNew()) {
          return Promise.promisify(this.beforeDestroy, this)().bind(this).return(Model);
        } else {
          return Model;
        }
      })
      .then(function (Model) {
        if (Model.tableReady && Model.tableReady !== true) {
          return Model.tableReady.return(Model);
        } else {
          return Model;
        }
      })
      .then(function (Model) {
        if (!this.isNew()) {
          if (Model.softDelete) {
            utils.deepMixIn(this.attributes, { deleted: Model.r.now() });
            if (Model.timestamps) {
              utils.deepMixIn(this.attributes, { updated: Model.r.now() });
            }
            return Model.connection.run(Model.r.table(Model.tableName).get(this.get(Model.idAttribute) || '').update(this.attributes, { returnChanges: true }), options);
          } else {
            return Model.connection.run(Model.r.table(Model.tableName).get(this.get(Model.idAttribute) || '').delete({ returnChanges: true }), options);
          }
        }
      })
      .then(function (cursor) {
        if (!this.isNew()) {
          if (cursor.errors !== 0) {
            throw new Error(cursor.first_error);
          } else {
            if (Model.softDelete) {
              utils.deepMixIn(this.attributes, utils.merge({}, cursor.changes[0].new_val));
            } else {
              utils.unset(this.attributes, Model.idAttribute);
            }
            this.previousAttributes = utils.merge({}, cursor.changes[0].old_val);
            this.meta = utils.merge({}, cursor);
            return Promise.promisify(this.afterDestroy, this)(this).bind(this);
          }
        } else {
          return this;
        }
      }).finally(function () {
        tasks = null;
      }).nodeify(cb);
  }

  return destroy;
};

