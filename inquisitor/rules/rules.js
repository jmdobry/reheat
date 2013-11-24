'use strict';

var mout = require('mout');

module.exports = {
	'canBeEmpty': function (attr, x) {
		if (mout.lang.isDate(x)) {
			return true;
		}
		return attr ? true : !mout.lang.isEmpty(x);
	},
	'nullable': function (attr, x) {
		return attr ? true : x !== null;
	},
	'required': function (attr, x) {
		if (attr) {
			if (x === false || x === 0) {
				return true;
			} else if (mout.lang.isString(x)) {
				return !mout.lang.isEmpty(x);
			} else {
				return !!x;
			}
		}
		return true;
	},
	'max': function (max, x) {
		if (mout.lang.isNumber(x)) {
			return x <= max;
		}
		return null;
	},
	'min': function (min, x) {
		if (mout.lang.isNumber(x)) {
			return x >= min;
		}
		return null;
	},
	'maxLength': function (maxLength, x) {
		if (mout.lang.isString(x) || mout.lang.isArray(x)) {
			return x.length <= maxLength;
		}
		return null;
	},
	'minLength': function (minLength, x) {
		if (mout.lang.isString(x) || mout.lang.isArray(x)) {
			return x.length >= minLength;
		}
		return null;
	}
};