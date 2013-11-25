/*global assert:true */
'use strict';

var assert = require('chai').assert;

module.exports = {
	fail: function (msg) {
		assert.equal('should not reach this!: ' + msg, 'failure');
	},
	TYPES_EXCEPT_STRING: [123, 123.123, null, undefined, {}, [], true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_ARRAY: [123, 123.123, null, undefined, {}, true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_NUMBER: [null, undefined, {}, [], true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_ARRAY_OR_NUMBER: [null, undefined, {}, true, false, function () {
	}],
	TYPES_EXCEPT_NUMBER: ['string', null, undefined, {}, [], true, false, function () {
	}],
	TYPES_EXCEPT_OBJECT: ['string', 123, 123.123, null, undefined, true, false, function () {
	}],
	TYPES_EXCEPT_BOOLEAN: ['string', 123, 123.123, null, undefined, {}, [], function () {
	}],
	TYPES_EXCEPT_FUNCTION: ['string', 123, 123.123, null, undefined, {}, [], true, false],
	CACHE_DEFAULTS: {
		capacity: Number.MAX_VALUE,
		maxAge: null,
		deleteOnExpire: 'none',
		onExpire: null,
		cacheFlushInterval: null,
		recycleFreq: 1000,
		storageMode: 'none',
		storageImpl: null,
		verifyIntegrity: true
	},
	assert: assert
};