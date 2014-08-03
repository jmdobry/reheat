module.exports = function (mout) {
  return {
    contains: mout.array.contains,
    every: mout.array.every,
    filter: mout.array.filter,
    find: mout.array.find,
    findLast: mout.array.findLast,
    findIndex: mout.array.findIndex,
    findLastIndex: mout.array.findLastIndex,
    forEach: mout.array.forEach,
    invoke: mout.array.invoke,
    map: mout.array.map,
    pluck: mout.array.pluck,
    reduce: mout.array.reduce,
    reject: mout.array.reject,
    remove: mout.array.remove,
    shuffle: mout.array.shuffle,
    slice: mout.array.slice,
    some: mout.array.some,
    sort: mout.array.sort,
    sortBy: mout.array.sortBy,
    split: mout.array.split,
    toLookup: mout.array.toLookup,
    unique: mout.array.unique,

    isString: mout.lang.isString,
    isBoolean: mout.lang.isBoolean,
    isNumber: mout.lang.isNumber,
    isObject: mout.lang.isObject,
    isDate: mout.lang.isDate,
    isFunction: mout.lang.isFunction,
    isArray: mout.lang.isArray,
    isEmpty: mout.lang.isEmpty,
    clone: mout.lang.clone,

    functions: mout.object.functions,
    get: mout.object.get,
    set: mout.object.set,
    unset: mout.object.unset,
    has: mout.object.has,
    hasOwn: mout.object.hasOwn,
    deepMixIn: mout.object.deepMixIn,
    pick: mout.object.pick,
    forOwn: mout.object.forOwn,
    merge: mout.object.merge,

    escapeHtml: mout.string.escapeHtml,
    upperCase: mout.string.upperCase,
    lowerCase: mout.string.lowerCase,
    camelCase: mout.string.camelCase,

    deepFreeze: function deepFreeze(o) {
      var prop, propKey;
      Object.freeze(o); // First freeze the object.
      for (propKey in o) {
        prop = o[propKey];
        if (!o.hasOwnProperty(propKey) || typeof prop !== 'object' || Object.isFrozen(prop)) {
          // If the object is on the prototype, not an object, or is already frozen,
          // skip it. Note that this might leave an unfrozen reference somewhere in the
          // object if there is an already frozen object containing an unfrozen object.
          continue;
        }

        deepFreeze(prop); // Recursively call deepFreeze.
      }
    }
  };
};
