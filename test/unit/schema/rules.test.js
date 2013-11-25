'use strict';

var rules = require('../../../lib/schema/rules'),
	assert = require('chai').assert;

describe('rules', function () {

	describe('canBeEmpty', function () {
		it('should allow empty values when set to true', function (done) {
			assert.isTrue(rules.canBeEmpty(true, ''), 'Should allow "".');
			assert.isTrue(rules.canBeEmpty(true, {}), 'Should allow {}.');
			assert.isTrue(rules.canBeEmpty(true, []), 'Should allow [].');
			done();
		});

		it('should disallow empty values when set to false', function (done) {
			assert.isFalse(rules.canBeEmpty(false, ''), 'Should disallow ""');
			assert.isFalse(rules.canBeEmpty(false, {}), 'Should disallow {}');
			assert.isFalse(rules.canBeEmpty(false, []), 'Should disallow []');
			done();
		});

		it('should always allow these values', function (done) {
			assert.isTrue(rules.canBeEmpty(false, -100), 'Should allow -100.');
			assert.isTrue(rules.canBeEmpty(true, -100), 'Should allow -100.');
			assert.isTrue(rules.canBeEmpty(false, 0), 'Should allow 0.');
			assert.isTrue(rules.canBeEmpty(true, 0), 'Should allow 0.');
			assert.isTrue(rules.canBeEmpty(false, 100), 'Should allow 100.');
			assert.isTrue(rules.canBeEmpty(true, 100), 'Should allow 100.');
			assert.isTrue(rules.canBeEmpty(false, 'asdf'), 'Should allow "asdf".');
			assert.isTrue(rules.canBeEmpty(true, 'asdf'), 'Should allow "asdf".');
			assert.isTrue(rules.canBeEmpty(false, false), 'Should allow false.');
			assert.isTrue(rules.canBeEmpty(true, false), 'Should allow false.');
			assert.isTrue(rules.canBeEmpty(false, true), 'Should allow true.');
			assert.isTrue(rules.canBeEmpty(true, true), 'Should allow true.');
			assert.isTrue(rules.canBeEmpty(false, null), 'Should allow null.');
			assert.isTrue(rules.canBeEmpty(true, null), 'Should allow null.');
			assert.isTrue(rules.canBeEmpty(false, undefined), 'Should allow undefined.');
			assert.isTrue(rules.canBeEmpty(true, undefined), 'Should allow undefined.');
			assert.isTrue(rules.canBeEmpty(false, new Date()), 'Should allow a date.');
			assert.isTrue(rules.canBeEmpty(true, new Date()), 'Should allow a date.');
			assert.isTrue(rules.canBeEmpty(false, ['stuff']), 'Should allow ["stuff"].');
			assert.isTrue(rules.canBeEmpty(true, ['stuff']), 'Should allow ["stuff"].');
			assert.isTrue(rules.canBeEmpty(false, {'stuff': 'stuff'}), 'Should allow {"stuff":"stuff"}.');
			assert.isTrue(rules.canBeEmpty(true, {'stuff': 'stuff'}), 'Should allow {"stuff":"stuff"}.');
			done();
		});
	});

	describe('nullable', function () {
		it('should allow null values when set to true', function (done) {
			assert.isTrue(rules.nullable(true, null), 'Should allow null.');
			done();
		});

		it('should disallow null values when set to false', function (done) {
			assert.isFalse(rules.nullable(false, null), 'Should disallow null');
			done();
		});

		it('should always allow these values', function (done) {
			assert.isTrue(rules.nullable(false, -100), 'Should allow -100.');
			assert.isTrue(rules.nullable(true, -100), 'Should allow -100.');
			assert.isTrue(rules.nullable(false, 0), 'Should allow 0.');
			assert.isTrue(rules.nullable(true, 0), 'Should allow 0.');
			assert.isTrue(rules.nullable(false, 100), 'Should allow 100.');
			assert.isTrue(rules.nullable(true, 100), 'Should allow 100.');
			assert.isTrue(rules.nullable(false, 'asdf'), 'Should allow "asdf".');
			assert.isTrue(rules.nullable(true, 'asdf'), 'Should allow "asdf".');
			assert.isTrue(rules.nullable(false, false), 'Should allow false.');
			assert.isTrue(rules.nullable(true, false), 'Should allow false.');
			assert.isTrue(rules.nullable(false, true), 'Should allow true.');
			assert.isTrue(rules.nullable(true, true), 'Should allow true.');
			assert.isTrue(rules.nullable(false, undefined), 'Should allow undefined.');
			assert.isTrue(rules.nullable(true, undefined), 'Should allow undefined.');
			assert.isTrue(rules.nullable(false, new Date()), 'Should allow a date.');
			assert.isTrue(rules.nullable(true, new Date()), 'Should allow a date.');
			assert.isTrue(rules.nullable(false, {}), 'Should allow {}.');
			assert.isTrue(rules.nullable(true, {}), 'Should allow {}.');
			assert.isTrue(rules.nullable(false, []), 'Should allow [].');
			assert.isTrue(rules.nullable(true, []), 'Should allow [].');
			assert.isTrue(rules.nullable(false, ['stuff']), 'Should allow ["stuff"].');
			assert.isTrue(rules.nullable(true, ['stuff']), 'Should allow ["stuff"].');
			assert.isTrue(rules.nullable(false, {'stuff': 'stuff'}), 'Should allow {"stuff":"stuff"}.');
			assert.isTrue(rules.nullable(true, {'stuff': 'stuff'}), 'Should allow {"stuff":"stuff"}.');
			done();
		});
	});

	describe('required', function () {
		it('should disallow these values when set to true', function (done) {
			assert.isFalse(rules.required(true, null), 'Should disallow null.');
			assert.isFalse(rules.required(true, undefined), 'Should disallow undefined.');
			assert.isFalse(rules.required(true, ''), 'Should disallow "".');
			done();
		});

		it('should allow these values when set to false', function (done) {
			assert.isTrue(rules.required(false, null), 'Should allow null.');
			assert.isTrue(rules.required(false, undefined), 'Should allow undefined.');
			assert.isTrue(rules.required(false, ''), 'Should allow "".');
			done();
		});

		it('should always allow these values', function (done) {
			assert.isTrue(rules.required(false, -100), 'Should allow -100.');
			assert.isTrue(rules.required(true, -100), 'Should allow -100.');
			assert.isTrue(rules.required(false, 0), 'Should allow 0.');
			assert.isTrue(rules.required(true, 0), 'Should allow 0.');
			assert.isTrue(rules.required(false, 100), 'Should allow 100.');
			assert.isTrue(rules.required(true, 100), 'Should allow 100.');
			assert.isTrue(rules.required(false, 'asdf'), 'Should allow "asdf".');
			assert.isTrue(rules.required(true, 'asdf'), 'Should allow "asdf".');
			assert.isTrue(rules.required(false, false), 'Should allow false.');
			assert.isTrue(rules.required(true, false), 'Should allow false.');
			assert.isTrue(rules.required(false, true), 'Should allow true.');
			assert.isTrue(rules.required(true, true), 'Should allow true.');
			assert.isTrue(rules.required(false, new Date()), 'Should allow a date.');
			assert.isTrue(rules.required(true, new Date()), 'Should allow a date.');
			assert.isTrue(rules.required(false, {}), 'Should allow {}.');
			assert.isTrue(rules.required(true, {}), 'Should allow {}.');
			assert.isTrue(rules.required(false, []), 'Should allow [].');
			assert.isTrue(rules.required(true, []), 'Should allow [].');
			assert.isTrue(rules.required(false, ['stuff']), 'Should allow ["stuff"].');
			assert.isTrue(rules.required(true, ['stuff']), 'Should allow ["stuff"].');
			assert.isTrue(rules.required(false, {'stuff': 'stuff'}), 'Should allow {"stuff":"stuff"}.');
			assert.isTrue(rules.required(true, {'stuff': 'stuff'}), 'Should allow {"stuff":"stuff"}.');
			done();
		});
	});

	describe('max', function () {
		it('should accept numbers less than or equal to the max', function (done) {
			assert.isTrue(rules.max(40, 40), 'Should allow 40 when max is 40.');
			assert.isTrue(rules.max(40, 39.9999), 'Should allow 39.9999 when max is 40.');
			assert.isTrue(rules.max(40, -39.9999), 'Should allow -39.9999 when max is 40.');
			assert.isTrue(rules.max(-40, -40.0001), 'Should allow -40.0001 when max is -40.');
			assert.isTrue(rules.max(-40, -100), 'Should allow -100 when max is -40.');
			done();
		});

		it('should disallow numbers greater than the max', function (done) {
			assert.isFalse(rules.max(40, 40.0001), 'Should disallow 40.0001 when max is 40.');
			assert.isFalse(rules.max(-40, -39.9999), 'Should disallow -39.9999 when max is -40.');
			done();
		});

		it('should return null if the value is not a number', function (done) {
			assert.strictEqual(rules.max(40, 'asdf'), null, 'Should return null for "asdf".');
			assert.strictEqual(rules.max(40, true), null, 'Should return null for true.');
			assert.strictEqual(rules.max(40, false), null, 'Should return null for false.');
			assert.strictEqual(rules.max(40, null), null, 'Should return null for null.');
			assert.strictEqual(rules.max(40, undefined), null, 'Should return null for undefined.');
			assert.strictEqual(rules.max(40, new Date()), null, 'Should return null for a date.');
			assert.strictEqual(rules.max(40, {}), null, 'Should return null for {}.');
			assert.strictEqual(rules.max(40, []), null, 'Should return null for [].');
			assert.strictEqual(rules.max(40, ['stuff']), null, 'Should return null for ["stuff"].');
			assert.strictEqual(rules.max(40, {'stuff': 'stuff'}), null, 'Should return null for {"stuff":"stuff"}.');
			done();
		});
	});

	describe('min', function () {
		it('should accept numbers greater than or equal to the min', function (done) {
			assert.isTrue(rules.min(40, 40), 'Should allow 40 when min is 40.');
			assert.isTrue(rules.min(40, 40.0001), 'Should allow 40.0001 when min is 40.');
			assert.isTrue(rules.min(-40, -39.9999), 'Should allow -39.9999 when min is -40.');
			assert.isTrue(rules.min(-40, -40), 'Should allow -40 when min is -40.');
			done();
		});

		it('should disallow numbers less than the min', function (done) {
			assert.isFalse(rules.min(40, 39.9999), 'Should disallow 39.9999 when min is 40.');
			assert.isFalse(rules.min(-40, -40.0001), 'Should disallow -40.0001 when min is -40.');
			done();
		});

		it('should return null if the value is not a number', function (done) {
			assert.strictEqual(rules.min(40, 'asdf'), null, 'Should return null for "asdf".');
			assert.strictEqual(rules.min(40, true), null, 'Should return null for true.');
			assert.strictEqual(rules.min(40, false), null, 'Should return null for false.');
			assert.strictEqual(rules.min(40, null), null, 'Should return null for null.');
			assert.strictEqual(rules.min(40, undefined), null, 'Should return null for undefined.');
			assert.strictEqual(rules.min(40, new Date()), null, 'Should return null for a date.');
			assert.strictEqual(rules.min(40, {}), null, 'Should return null for {}.');
			assert.strictEqual(rules.min(40, []), null, 'Should return null for [].');
			assert.strictEqual(rules.min(40, ['stuff']), null, 'Should return null for ["stuff"].');
			assert.strictEqual(rules.min(40, {'stuff': 'stuff'}), null, 'Should return null for {"stuff":"stuff"}.');
			done();
		});
	});

	describe('maxLength', function () {
		it('should accept lengths less than or equal to the maxLength', function (done) {
			assert.isTrue(rules.maxLength(10, '1234567890'), 'Should allow "1234567890" when maxLength is 10.');
			assert.isTrue(rules.maxLength(10, '123456789'), 'Should allow "123456789" when maxLength is 10.');
			assert.isTrue(rules.maxLength(0, ''), 'Should allow "" when maxLength is 0.');
			assert.isTrue(rules.maxLength(2, ['1', '2']), 'Should allow ["1", "2"] when maxLength is 2.');
			assert.isTrue(rules.maxLength(0, []), 'Should allow [] when maxLength is 0.');
			done();
		});

		it('should disallow lengths greater than the maxLength', function (done) {
			assert.isFalse(rules.maxLength(9, '1234567890'), 'Should disallow "1234567890" when maxLength is 9.');
			assert.isFalse(rules.maxLength(1, '123456789'), 'Should disallow "123456789" when maxLength is 1.');
			assert.isFalse(rules.maxLength(0, 'a'), 'Should disallow "a" when maxLength is 0.');
			assert.isFalse(rules.maxLength(2, ['1', '2', '3']), 'Should disallow ["1", "2", "3"] when maxLength is 3.');
			assert.isFalse(rules.maxLength(0, ['1']), 'Should disallow [] when maxLength is 1.');
			done();
		});

		it('should return null if the value is not a string or an array', function (done) {
			assert.strictEqual(rules.maxLength(40, true), null, 'Should return null for true.');
			assert.strictEqual(rules.maxLength(40, false), null, 'Should return null for false.');
			assert.strictEqual(rules.maxLength(40, null), null, 'Should return null for null.');
			assert.strictEqual(rules.maxLength(40, undefined), null, 'Should return null for undefined.');
			assert.strictEqual(rules.maxLength(40, new Date()), null, 'Should return null for a date.');
			assert.strictEqual(rules.maxLength(40, {}), null, 'Should return null for {}.');
			assert.strictEqual(rules.maxLength(40, {'stuff': 'stuff'}), null, 'Should return null for {"stuff":"stuff"}.');
			done();
		});
	});

	describe('minLength', function () {
		it('should accept lengths greater than or equal to the minLength', function (done) {
			assert.isTrue(rules.minLength(10, '1234567890'), 'Should allow "1234567890" when minLength is 10.');
			assert.isTrue(rules.minLength(1, '123456789'), 'Should allow "123456789" when minLength is 1.');
			assert.isTrue(rules.minLength(0, ''), 'Should allow "" when minLength is 0.');
			assert.isTrue(rules.minLength(2, ['1', '2']), 'Should allow ["1", "2"] when minLength is 2.');
			assert.isTrue(rules.minLength(0, []), 'Should allow [] when minLength is 0.');
			done();
		});

		it('should disallow lengths less than the minLength', function (done) {
			assert.isFalse(rules.minLength(11, '1234567890'), 'Should disallow "1234567890" when minLength is 11.');
			assert.isFalse(rules.minLength(1, ''), 'Should disallow "" when minLength is 1.');
			assert.isFalse(rules.minLength(4, ['1', '2', '3']), 'Should disallow ["1", "2", "3"] when minLength is 4.');
			assert.isFalse(rules.minLength(1, []), 'Should disallow [] when minLength is 1.');
			done();
		});

		it('should return null if the value is not a string or an array', function (done) {
			assert.strictEqual(rules.minLength(40, true), null, 'Should return null for true.');
			assert.strictEqual(rules.minLength(40, false), null, 'Should return null for false.');
			assert.strictEqual(rules.minLength(40, null), null, 'Should return null for null.');
			assert.strictEqual(rules.minLength(40, undefined), null, 'Should return null for undefined.');
			assert.strictEqual(rules.minLength(40, new Date()), null, 'Should return null for a date.');
			assert.strictEqual(rules.minLength(40, {}), null, 'Should return null for {}.');
			assert.strictEqual(rules.minLength(40, {'stuff': 'stuff'}), null, 'Should return null for {"stuff":"stuff"}.');
			done();
		});
	});
});
