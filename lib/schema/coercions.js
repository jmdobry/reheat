'use strict';

var mout = require('mout');

module.exports = {
	'string': function (x) {
		if (mout.lang.isNumber(x)) {
			return mout.lang.toString(x);
		}
		return x;
	},
	'number': mout.lang.toNumber,
	'integer': function (x) {
		var num = mout.lang.toNumber(x);
		if (mout.lang.isNumber(num) && !isNaN(num)) {
			return mout.number.toInt(num);
		}
		return mout.lang.toNumber(x);
	},
	'float': function (x) {
		if (x === null || x === '' || x === false || mout.lang.isUndefined(x)) {
			return 0.0;
		} else if (x === true) {
			return 1.0;
		}
		return parseFloat(x);
	},
	'array': function (x) {
		if (mout.lang.isArray(x) && !mout.lang.isEmpty(x)) {
			return x;
		} else if (x === null || mout.lang.isUndefined(x) || mout.lang.isEmpty(x)) {
			return null;
		}
		return [x];
	},
	'object': function (x) {
		if (mout.lang.isObject(x) && !mout.lang.isEmpty(x)) {
			return x;
		} else if (x === null || mout.lang.isUndefined(x) || mout.lang.isEmpty(x)) {
			return null;
		}
		return x;
	},
	'boolean': function (x) {
		if (mout.lang.isEmpty(x)) {
			return false;
		}
		return !!x;
	}
	// TODO: Coercions for dates
};