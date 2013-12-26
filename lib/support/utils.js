module.exports = {
	forEach: require('mout/array/forEach'),

	isString: require('mout/lang/isString'),
	isBoolean: require('mout/lang/isBoolean'),
	isNumber: require('mout/lang/isNumber'),
	isObject: require('mout/lang/isObject'),
	isFunction: require('mout/lang/isFunction'),
	isArray: require('mout/lang/isArray'),
	isEmpty: require('mout/lang/isEmpty'),
	clone: require('mout/lang/clone'),

	contains: require('mout/object/contains'),
	functions: require('mout/object/functions'),
	get: require('mout/object/get'),
	set: require('mout/object/set'),
	unset: require('mout/object/unset'),
	has: require('mout/object/has'),
	hasOwn: require('mout/object/hasOwn'),
	keys: require('mout/object/keys'),
	pick: require('mout/object/pick'),
	pluck: require('mout/object/pluck'),
	deepMixIn: require('mout/object/deepMixIn'),

	escapeHtml: require('mout/string/escapeHtml'),
	uppercase: require('mout/string/uppercase')
};
