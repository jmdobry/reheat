'use strict';

var coercions = require('../../../lib/schema/coercions'),
	assert = require('chai').assert;

describe('coercions', function () {

	describe('string coercions', function () {
		it('should coerce to string', function (done) {
			assert.strictEqual(coercions.string(-100), '-100', 'Should coerce -100 to "-100".');
			assert.strictEqual(coercions.string(0), '0', 'Should coerce 0 to "0".');
			assert.strictEqual(coercions.string('already a string'), 'already a string', 'Should coerce "already a string" to "already a string".');
			assert.strictEqual(coercions.string(100), '100', 'Should coerce 100 to "100".');
			assert.strictEqual(coercions.string(-99.9), '-99.9', 'Should coerce -99.9 to a "-99.9".');
			assert.strictEqual(coercions.string(99.9), '99.9', 'Should coerce -100 to a "99.9".');
			done();
		});

		it('should NOT coerce to string', function (done) {
			assert.strictEqual(coercions.string(null), null, 'Should leave as is.');
			assert.strictEqual(coercions.string(undefined), undefined, 'Should leave as is.');
			assert.strictEqual(coercions.string(false), false, 'Should leave as is.');
			assert.strictEqual(coercions.string(true), true, 'Should leave as is.');
			assert.deepEqual(coercions.string({}), {}, 'Should leave as is.');
			assert.deepEqual(coercions.string([]), [], 'Should leave as is.');
			assert.typeOf(coercions.string(new Date()), 'date', 'Should leave as is.');
			done();
		});
	});

	describe('number coercions', function () {
		it('should coerce to a number', function (done) {
			assert.strictEqual(coercions.number('-100'), -100, 'Should coerce "-100" to -100.');
			assert.strictEqual(coercions.number('-99.9'), -99.9, 'Should coerce "-99.9" to -99.9.');
			assert.strictEqual(coercions.number('-99.1'), -99.1, 'Should coerce "-99.1" to -99.1.');
			assert.strictEqual(coercions.number('-0.75'), -0.75, 'Should coerce "-0.75" to -0.75.');
			assert.strictEqual(coercions.number('-0.25'), -0.25, 'Should coerce "-0.25" to -0.25.');
			assert.strictEqual(coercions.number('0'), 0, 'Should coerce "0" to 0.');
			assert.strictEqual(coercions.number('0.25'), 0.25, 'Should coerce "0.25" to 0.25.');
			assert.strictEqual(coercions.number('0.75'), 0.75, 'Should coerce "0.75" to 0.75.');
			assert.strictEqual(coercions.number('99.1'), 99.1, 'Should coerce "99.1" to 99.1.');
			assert.strictEqual(coercions.number('99.9'), 99.9, 'Should coerce "99.9" to 99.9.');
			assert.strictEqual(coercions.number('100'), 100, 'Should coerce "100" to 100.');
			assert.strictEqual(coercions.number(new Date(1985, 6, 23)), 490946400000, 'Should coerce a date to 490946400000.');
			done();
		});

		it('should coerce to zero', function (done) {
			assert.strictEqual(coercions.number(''), 0, 'Should coerce an empty string to 0.');
			assert.strictEqual(coercions.number(null), 0, 'Should coerce null to a 0.');
			assert.strictEqual(coercions.number(undefined), 0, 'Should coerce undefined to 0.');
			assert.strictEqual(coercions.number(false), 0, 'Should coerce false to 0.');
			done();
		});

		it('should coerce to one', function (done) {
			assert.strictEqual(coercions.number(true), 1, 'Should coerce true to 1.');
			done();
		});

		it('should coerce to NaN', function (done) {
			assert.isTrue(isNaN(coercions.number({})), 'Should coerce an object to NaN.');
			assert.isTrue(isNaN(coercions.number([])), 'Should coerce an array to NaN.');
			assert.isTrue(isNaN(coercions.number('some string')), 'Should coerce an string (that does not represent a number) to NaN.');
			done();
		});
	});

	describe('integer coercions', function () {
		it('should coerce to an integer', function (done) {
			assert.strictEqual(coercions.integer('-100'), -100, 'Should coerce "-100" to -100.');
			assert.strictEqual(coercions.integer('-99.9'), -99, 'Should coerce "-99.9" to -99.');
			assert.strictEqual(coercions.integer('-99.1'), -99, 'Should coerce "-99.1" to -99.');
			assert.strictEqual(coercions.integer('-0.75'), 0, 'Should coerce "-0.75" to 0.');
			assert.strictEqual(coercions.integer('-0.25'), 0, 'Should coerce "-0.25" to 0.');
			assert.strictEqual(coercions.integer('0'), 0, 'Should coerce "0" to 0.');
			assert.strictEqual(coercions.integer('0.25'), 0, 'Should coerce "0.25" to 0.');
			assert.strictEqual(coercions.integer('0.75'), 0, 'Should coerce "0.75" to 0.');
			assert.strictEqual(coercions.integer('99.1'), 99, 'Should coerce "99.1" to 99.');
			assert.strictEqual(coercions.integer('99.9'), 99, 'Should coerce "99.9" to 99.');
			assert.strictEqual(coercions.integer('100'), 100, 'Should coerce "100" to 100.');
			done();
		});

		it('should coerce to zero', function (done) {
			assert.strictEqual(coercions.integer(''), 0, 'Should coerce an empty string to 0.');
			assert.strictEqual(coercions.integer(null), 0, 'Should coerce null to a 0.');
			assert.strictEqual(coercions.integer(undefined), 0, 'Should coerce undefined to 0.');
			assert.strictEqual(coercions.integer(false), 0, 'Should coerce false to 0.');
			done();
		});

		it('should coerce to one', function (done) {
			assert.strictEqual(coercions.integer(true), 1, 'Should coerce true to 1.');
			done();
		});

		it('should coerce to NaN', function (done) {
			assert.isTrue(isNaN(coercions.integer({})), 'Should coerce an object to NaN.');
			assert.isTrue(isNaN(coercions.integer([])), 'Should coerce an array to NaN.');
			assert.isTrue(isNaN(coercions.integer('some string')), 'Should coerce an string (that does not represent a number) to NaN.');
			done();
		});
	});

	describe('float coercions', function () {
		it('should coerce to a float', function (done) {
			assert.strictEqual(coercions.float('-100'), -100, 'Should coerce "-100" to -100.');
			assert.strictEqual(coercions.float('-99.9'), -99.9, 'Should coerce "-99.9" to -99.9.');
			assert.strictEqual(coercions.float('-99.1'), -99.1, 'Should coerce "-99.1" to -99.1.');
			assert.strictEqual(coercions.float('-0.75'), -0.75, 'Should coerce "-0.75" to -0.75.');
			assert.strictEqual(coercions.float('-0.25'), -0.25, 'Should coerce "-0.25" to -0.25.');
			assert.strictEqual(coercions.float('0'), 0, 'Should coerce "0" to 0.');
			assert.strictEqual(coercions.float('0.25'), 0.25, 'Should coerce "0.25" to 0.25.');
			assert.strictEqual(coercions.float('0.75'), 0.75, 'Should coerce "0.75" to 0.75.');
			assert.strictEqual(coercions.float('99.1'), 99.1, 'Should coerce "99.1" to 99.1.');
			assert.strictEqual(coercions.float('99.9'), 99.9, 'Should coerce "99.9" to 99.9.');
			assert.strictEqual(coercions.float('100'), 100, 'Should coerce "100" to 100.');
			done();
		});

		it('should coerce to zero', function (done) {
			assert.strictEqual(coercions.float(''), 0, 'Should coerce an empty string to 0.');
			assert.strictEqual(coercions.float(null), 0, 'Should coerce null to a 0.');
			assert.strictEqual(coercions.float(undefined), 0, 'Should coerce undefined to 0.');
			assert.strictEqual(coercions.float(false), 0, 'Should coerce false to 0.');
			done();
		});

		it('should coerce to one', function (done) {
			assert.strictEqual(coercions.float(true), 1, 'Should coerce true to one.');
			done();
		});

		it('should coerce to NaN', function (done) {
			assert.isTrue(isNaN(coercions.float({})), 'Should coerce an object to NaN.');
			assert.isTrue(isNaN(coercions.float([])), 'Should coerce an array to NaN.');
			assert.isTrue(isNaN(coercions.float('some string')), 'Should coerce an string (that does not represent a number) to NaN.');
			done();
		});
	});

	describe('array coercions', function () {
		it('should coerce to an array', function (done) {
			assert.deepEqual(coercions.array(4), [4], 'Should coerce [] to [4].');
			assert.deepEqual(coercions.array('stuff'), ['stuff'], 'Should coerce [] to ["stuff"].');
			assert.deepEqual(coercions.array(true), [true], 'Should coerce [] to [true].');
			assert.deepEqual(coercions.array(false), [false], 'Should coerce [] to [false].');
			done();
		});

		it('should coerce to null', function (done) {
			assert.strictEqual(coercions.array([]), null, 'Should coerce [] to null.');
			assert.strictEqual(coercions.array(null), null, 'Should coerce null to null.');
			assert.strictEqual(coercions.array(undefined), null, 'Should coerce undefined to null.');
			assert.strictEqual(coercions.array({}), null, 'Should coerce {} to null.');
			assert.strictEqual(coercions.array(''), null, 'Should coerce an empty string to null.');
			done();
		});
	});

	describe('object coercions', function () {
		it('should coerce to an object', function (done) {
			assert.deepEqual(coercions.object({
				'stuff': 'stuff'
			}), {
				'stuff': 'stuff'
			}, 'Should coerce { "stuff": "stuff" } to { "stuff": "stuff" }.');
			done();
		});

		it('should coerce to null', function (done) {
			assert.strictEqual(coercions.object([]), null, 'Should coerce [] to null.');
			assert.strictEqual(coercions.object(null), null, 'Should coerce null to null.');
			assert.strictEqual(coercions.object(undefined), null, 'Should coerce undefined to null.');
			assert.strictEqual(coercions.object({}), null, 'Should coerce {} to null.');
			assert.strictEqual(coercions.object(''), null, 'Should coerce an empty string to null.');
			done();
		});
	});

	describe('boolean coercions', function () {
		it('should coerce to a boolean', function (done) {
			assert.strictEqual(coercions.boolean(''), false, 'Should coerce an empty string to false.');
			assert.strictEqual(coercions.boolean({}), false, 'Should coerce an empty object to false.');
			assert.strictEqual(coercions.boolean([]), false, 'Should coerce an empty array to false.');
			assert.strictEqual(coercions.boolean(null), false, 'Should coerce null to false.');
			assert.strictEqual(coercions.boolean(undefined), false, 'Should coerce undefined to false.');
			assert.strictEqual(coercions.boolean(0), false, 'Should coerce 0 to false.');
			assert.strictEqual(coercions.boolean(-1), true, 'Should coerce negative number to true.');
			assert.strictEqual(coercions.boolean(1), true, 'Should coerce a positive to true.');
			assert.strictEqual(coercions.boolean('asdf'), true, 'Should coerce non-empty string to true.');
			assert.strictEqual(coercions.boolean({'asdf': 'asdf'}), true, 'Should coerce a non-empty object to true.');
			assert.strictEqual(coercions.boolean(['asdf']), true, 'Should coerce a non-empty array to true.');
			done();
		});
	});
});
