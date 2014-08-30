module.exports = function (Promise, utils) {
  /**
   * @doc method
   * @id Collection.instance_methods:save
   * @name save
   * @description
   * Call `save()` on every model instance in this collection. Not very efficient. When saved, each model
   * instance will run through its model lifecycle (`beforeValidate`, `afterCreate`, etc.).
   *
   * ## Signature:
   * ```js
   * Collection#save([options][, cb])
   * ```
   *
   * ## Examples:
   *
   * ### Promise-style:
   * ```js
   *  TODO
   * ```
   *
   * ### Node-style:
   * ```js
   *  TODO
   * ```
   *
   * ## Throws/Rejects with:
   *
   * - `{ValidationError}`
   * - `{IllegalArgumentError}`
   * - `{UnhandledError}`
   *
   * @param {object=} options Optional configuration options.
   * @param {function=} cb Optional callback function for Node-style usage. Signature: `cb(err, instance)`. Arguments:
   *
   * - `{ValidationError|UnhandledError}` - `err` - `null` if no error occurs.
   * - `{object}` - `instance` - If no error occurs, a reference to the collection instance on which
   * `save([options][, cb])` was called.
   * @returns {Promise} Promise.
   */
  function save(options, cb) {
    var tasks = [];
    var _this = this;

    options = options || {};

    if (utils.isFunction(options)) {
      cb = options;
      options = {};
    }

    this.forEach(function (instance) {
      tasks.push(instance.save(options, cb));
    });

    return Promise.all(tasks)
      .then(function () {
        return _this;
      })
      .nodeify(cb);
  }

  return save;
};

