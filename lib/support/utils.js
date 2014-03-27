module.exports = function (mout) {
	return {
		forEach: mout.array.forEach,
		contains: mout.array.contains,

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
