module.exports = {
	fail: function (msg) {
		assert.equal('should not reach this!: ' + msg, 'failure');
	},
	TYPES_EXCEPT_STRING: [123, 123.123, null, undefined, {}, [], true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_ARRAY: [123, 123.123, null, undefined, {}, true, false, function () {
	}],
	TYPES_EXCEPT_ARRAY: ['string', 123, 123.123, null, undefined, {}, true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_OBJECT: [123, 123.123, null, undefined, [], true, false, function () {
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
	TYPES_EXCEPT_FUNCTION: ['string', 123, 123.123, null, undefined, {}, [], true, false]
};
