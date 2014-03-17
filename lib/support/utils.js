module.exports = {
	forEach: require('mout/array/forEach'),
	contains: require('mout/array/contains'),

	isString: require('mout/lang/isString'),
	isBoolean: require('mout/lang/isBoolean'),
	isNumber: require('mout/lang/isNumber'),
	isObject: require('mout/lang/isObject'),
	isDate: require('mout/lang/isDate'),
	isFunction: require('mout/lang/isFunction'),
	isArray: require('mout/lang/isArray'),
	isEmpty: require('mout/lang/isEmpty'),
	clone: require('mout/lang/clone'),

	functions: require('mout/object/functions'),
	get: require('mout/object/get'),
	set: require('mout/object/set'),
	unset: require('mout/object/unset'),
	has: require('mout/object/has'),
	hasOwn: require('mout/object/hasOwn'),
	deepMixIn: require('mout/object/deepMixIn'),
	pick: require('mout/object/pick'),
	forOwn: require('mout/object/forOwn'),

	escapeHtml: require('mout/string/escapeHtml'),
	upperCase: require('mout/string/upperCase'),
	lowerCase: require('mout/string/lowerCase'),
	camelCase: require('mout/string/camelCase'),

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
