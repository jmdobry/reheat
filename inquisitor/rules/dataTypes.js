'use strict';

var mout = require('mout');

module.exports = {
	'string': mout.lang.isString,
	'number': mout.lang.isNumber,
	'integer': function (x) {
		if (!mout.lang.isNumber(x)) {
			return false;
		}
		return Math.abs(x) - Math.abs(mout.number.toInt(x)) === 0;
	},
	'float': mout.lang.isNumber,
	'array': mout.lang.isArray,
	'object': mout.lang.isObject,
	'boolean': mout.lang.isBoolean,
	'date': mout.lang.isDate
};