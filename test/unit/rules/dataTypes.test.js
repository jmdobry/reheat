'use strict';

var dataTypes = require('../../../inquisitor/rules/dataTypes'),
	assert = require('chai').assert;

describe('dataTypes', function () {

	describe('string data type', function () {
		it('should be recognized as a string', function (done) {
			assert.isTrue(dataTypes.string(''), 'Should recognize "" as a string.');
			assert.isTrue(dataTypes.string('asdf'), 'Should recognize "asdf" as a string.');
			done();
		});

		it('should fail to be recognized as a string', function (done) {
			assert.isFalse(dataTypes.string(0), 'Should fail to recognize 0 as a string.');
			assert.isFalse(dataTypes.string(1), 'Should fail to recognize 1 as a string.');
			assert.isFalse(dataTypes.string(null), 'Should fail to recognize null as a string.');
			assert.isFalse(dataTypes.string(undefined), 'Should fail to recognize undefined as a string.');
			assert.isFalse(dataTypes.string({}), 'Should fail to recognize {} as a string.');
			assert.isFalse(dataTypes.string([]), 'Should fail to recognize [] as a string.');
			assert.isFalse(dataTypes.string(true), 'Should fail to recognize true as a string.');
			assert.isFalse(dataTypes.string(false), 'Should fail to recognize false as a string.');
			assert.isFalse(dataTypes.string(new Date()), 'Should fail to recognize a date as a string.');
			done();
		});
	});

	describe('number data type', function () {
		it('should be recognized as a number', function (done) {
			assert.isTrue(dataTypes.number(-100), 'Should recognize -100 as a number.');
			assert.isTrue(dataTypes.number(-99.9), 'Should recognize -99.9 as a number.');
			assert.isTrue(dataTypes.number(-99.1), 'Should recognize -99.1 as a number.');
			assert.isTrue(dataTypes.number(-0.75), 'Should recognize -0.75 as a number.');
			assert.isTrue(dataTypes.number(-0.25), 'Should recognize -0.25 as a number.');
			assert.isTrue(dataTypes.number(0), 'Should recognize 0 as a number.');
			assert.isTrue(dataTypes.number(0.25), 'Should recognize 0.25 as a number.');
			assert.isTrue(dataTypes.number(0.75), 'Should recognize 0.75 as a number.');
			assert.isTrue(dataTypes.number(99.1), 'Should recognize 99.1 as a number.');
			assert.isTrue(dataTypes.number(99.9), 'Should recognize 99.9 as a number.');
			assert.isTrue(dataTypes.number(100), 'Should recognize 100 as a number.');
			done();
		});

		it('should fail to be recognized as a number', function (done) {
			assert.isFalse(dataTypes.number(''), 'Should fail to recognize "" as a number.');
			assert.isFalse(dataTypes.number('asdf'), 'Should fail to recognize "asdf" as a number.');
			assert.isFalse(dataTypes.number(null), 'Should fail to recognize null as a number.');
			assert.isFalse(dataTypes.number(undefined), 'Should fail to recognize undefined as a number.');
			assert.isFalse(dataTypes.number({}), 'Should fail to recognize {} as a number.');
			assert.isFalse(dataTypes.number([]), 'Should fail to recognize [] as a number.');
			assert.isFalse(dataTypes.number(true), 'Should fail to recognize true as a number.');
			assert.isFalse(dataTypes.number(false), 'Should fail to recognize false as a number.');
			assert.isFalse(dataTypes.number(new Date()), 'Should fail to recognize a date as a number.');
			done();
		});
	});

	describe('integer data type', function () {
		it('should be recognized as an integer', function (done) {
			assert.isTrue(dataTypes.integer(-100), 'Should recognize -100 as an integer.');
			assert.isTrue(dataTypes.integer(0), 'Should recognize 0 as an integer.');
			assert.isTrue(dataTypes.integer(100), 'Should recognize 100 as an integer.');
			done();
		});

		it('should fail to be recognized as an integer', function (done) {
			assert.isFalse(dataTypes.integer(-99.9), 'Should fail to recognize -99.9 as an integer.');
			assert.isFalse(dataTypes.integer(-99.1), 'Should fail to recognize -99.1 as an integer.');
			assert.isFalse(dataTypes.integer(-0.75), 'Should fail to recognize -0.75 as an integer.');
			assert.isFalse(dataTypes.integer(-0.25), 'Should fail to recognize -0.25 as an integer.');
			assert.isFalse(dataTypes.integer(0.25), 'Should fail to recognize 0.25 as an integer.');
			assert.isFalse(dataTypes.integer(0.75), 'Should fail to recognize 0.75 as an integer.');
			assert.isFalse(dataTypes.integer(99.1), 'Should fail to recognize 99.1 as an integer.');
			assert.isFalse(dataTypes.integer(99.9), 'Should fail to recognize 99.9 as an integer.');
			assert.isFalse(dataTypes.integer(''), 'Should fail to recognize "" as an integer.');
			assert.isFalse(dataTypes.integer('asdf'), 'Should fail to recognize "asdf" as an integer.');
			assert.isFalse(dataTypes.integer(null), 'Should fail to recognize null as an integer.');
			assert.isFalse(dataTypes.integer(undefined), 'Should fail to recognize undefined as an integer.');
			assert.isFalse(dataTypes.integer({}), 'Should fail to recognize {} as an integer.');
			assert.isFalse(dataTypes.integer([]), 'Should fail to recognize [] as an integer.');
			assert.isFalse(dataTypes.integer(true), 'Should fail to recognize true as an integer.');
			assert.isFalse(dataTypes.integer(false), 'Should fail to recognize false as an integer.');
			assert.isFalse(dataTypes.integer(new Date()), 'Should fail to recognize a date as an integer.');
			done();
		});
	});

	describe('float data type', function () {
		it('should be recognized as a float', function (done) {
			assert.isTrue(dataTypes.float(-100), 'Should recognize -100 as a float.');
			assert.isTrue(dataTypes.float(0), 'Should recognize 0 as a float.');
			assert.isTrue(dataTypes.float(100), 'Should recognize 100 as a float.');
			assert.isTrue(dataTypes.float(-99.9), 'Should recognize -99.9 as a float.');
			assert.isTrue(dataTypes.float(-99.1), 'Should recognize -99.1 as a float.');
			assert.isTrue(dataTypes.float(-0.75), 'Should recognize -0.75 as a float.');
			assert.isTrue(dataTypes.float(-0.25), 'Should recognize -0.25 as a float.');
			assert.isTrue(dataTypes.float(0.25), 'Should recognize 0.25 as a float.');
			assert.isTrue(dataTypes.float(0.75), 'Should recognize 0.75 as a float.');
			assert.isTrue(dataTypes.float(99.1), 'Should recognize 99.1 as a float.');
			assert.isTrue(dataTypes.float(99.9), 'Should recognize 99.9 as a float.');
			done();
		});

		it('should fail to be recognized as a float', function (done) {
			assert.isFalse(dataTypes.float(''), 'Should fail to recognize "" as a float.');
			assert.isFalse(dataTypes.float('asdf'), 'Should fail to recognize "asdf" as a float.');
			assert.isFalse(dataTypes.float(null), 'Should fail to recognize null as a float.');
			assert.isFalse(dataTypes.float(undefined), 'Should fail to recognize undefined as a float.');
			assert.isFalse(dataTypes.float({}), 'Should fail to recognize {} as a float.');
			assert.isFalse(dataTypes.float([]), 'Should fail to recognize [] as a float.');
			assert.isFalse(dataTypes.float(true), 'Should fail to recognize true as a float.');
			assert.isFalse(dataTypes.float(false), 'Should fail to recognize false as a float.');
			assert.isFalse(dataTypes.float(new Date()), 'Should fail to recognize a date as a float.');
			done();
		});
	});

	describe('array data type', function () {
		it('should be recognized as an array', function (done) {
			assert.isTrue(dataTypes.array([]), 'Should recognize [] as an array.');
			done();
		});

		it('should fail to be recognized as an array', function (done) {
			assert.isFalse(dataTypes.array(-100), 'Should fail to recognize -100 as an array.');
			assert.isFalse(dataTypes.array(0), 'Should fail to recognize 0 as an array.');
			assert.isFalse(dataTypes.array(100), 'Should fail to recognize 100 as an array.');
			assert.isFalse(dataTypes.array(-99.9), 'Should fail to recognize -99.9 as an array.');
			assert.isFalse(dataTypes.array(-99.1), 'Should fail to recognize -99.1 as an array.');
			assert.isFalse(dataTypes.array(-0.75), 'Should fail to recognize -0.75 as an array.');
			assert.isFalse(dataTypes.array(-0.25), 'Should fail to recognize -0.25 as an array.');
			assert.isFalse(dataTypes.array(0.25), 'Should fail to recognize 0.25 as an array.');
			assert.isFalse(dataTypes.array(0.75), 'Should fail to recognize 0.75 as an array.');
			assert.isFalse(dataTypes.array(99.1), 'Should fail to recognize 99.1 as an array.');
			assert.isFalse(dataTypes.array(99.9), 'Should fail to recognize 99.9 as an array.');
			assert.isFalse(dataTypes.array(''), 'Should fail to recognize "" as an array.');
			assert.isFalse(dataTypes.array('asdf'), 'Should fail to recognize "asdf" as an array.');
			assert.isFalse(dataTypes.array(null), 'Should fail to recognize null as an array.');
			assert.isFalse(dataTypes.array(undefined), 'Should fail to recognize undefined as an array.');
			assert.isFalse(dataTypes.array({}), 'Should fail to recognize {} as an array.');
			assert.isFalse(dataTypes.array(true), 'Should fail to recognize true as an array.');
			assert.isFalse(dataTypes.array(false), 'Should fail to recognize false as an array.');
			assert.isFalse(dataTypes.array(new Date()), 'Should fail to recognize a date as an array.');
			done();
		});
	});

	describe('object data type', function () {
		it('should be recognized as an object', function (done) {
			assert.isTrue(dataTypes.object({}), 'Should recognize {} as an object.');
			done();
		});

		it('should fail to be recognized as an object', function (done) {
			assert.isFalse(dataTypes.object(-100), 'Should fail to recognize -100 as an object.');
			assert.isFalse(dataTypes.object(0), 'Should fail to recognize 0 as an object.');
			assert.isFalse(dataTypes.object(100), 'Should fail to recognize 100 as an object.');
			assert.isFalse(dataTypes.object(-99.9), 'Should fail to recognize -99.9 as an object.');
			assert.isFalse(dataTypes.object(-99.1), 'Should fail to recognize -99.1 as an object.');
			assert.isFalse(dataTypes.object(-0.75), 'Should fail to recognize -0.75 as an object.');
			assert.isFalse(dataTypes.object(-0.25), 'Should fail to recognize -0.25 as an object.');
			assert.isFalse(dataTypes.object(0.25), 'Should fail to recognize 0.25 as an object.');
			assert.isFalse(dataTypes.object(0.75), 'Should fail to recognize 0.75 as an object.');
			assert.isFalse(dataTypes.object(99.1), 'Should fail to recognize 99.1 as an object.');
			assert.isFalse(dataTypes.object(99.9), 'Should fail to recognize 99.9 as an object.');
			assert.isFalse(dataTypes.object(''), 'Should fail to recognize "" as an object.');
			assert.isFalse(dataTypes.object('asdf'), 'Should fail to recognize "asdf" as an object.');
			assert.isFalse(dataTypes.object(null), 'Should fail to recognize null as an object.');
			assert.isFalse(dataTypes.object(undefined), 'Should fail to recognize undefined as an object.');
			assert.isFalse(dataTypes.object([]), 'Should fail to recognize [] as an object.');
			assert.isFalse(dataTypes.object(true), 'Should fail to recognize true as an object.');
			assert.isFalse(dataTypes.object(false), 'Should fail to recognize false as an object.');
			assert.isFalse(dataTypes.object(new Date()), 'Should fail to recognize a date as an object.');
			done();
		});
	});

	describe('boolean data type', function () {
		it('should be recognized as a boolean', function (done) {
			assert.isTrue(dataTypes.boolean(true), 'Should recognize true as an boolean.');
			assert.isTrue(dataTypes.boolean(false), 'Should recognize false as an boolean.');
			done();
		});

		it('should fail to be recognized as an boolean', function (done) {
			assert.isFalse(dataTypes.boolean(-100), 'Should fail to recognize -100 as a boolean.');
			assert.isFalse(dataTypes.boolean(0), 'Should fail to recognize 0 as a boolean.');
			assert.isFalse(dataTypes.boolean(100), 'Should fail to recognize 100 as a boolean.');
			assert.isFalse(dataTypes.boolean(-99.9), 'Should fail to recognize -99.9 as a boolean.');
			assert.isFalse(dataTypes.boolean(-99.1), 'Should fail to recognize -99.1 as a boolean.');
			assert.isFalse(dataTypes.boolean(-0.75), 'Should fail to recognize -0.75 as a boolean.');
			assert.isFalse(dataTypes.boolean(-0.25), 'Should fail to recognize -0.25 as a boolean.');
			assert.isFalse(dataTypes.boolean(0.25), 'Should fail to recognize 0.25 as a boolean.');
			assert.isFalse(dataTypes.boolean(0.75), 'Should fail to recognize 0.75 as a boolean.');
			assert.isFalse(dataTypes.boolean(99.1), 'Should fail to recognize 99.1 as a boolean.');
			assert.isFalse(dataTypes.boolean(99.9), 'Should fail to recognize 99.9 as a boolean.');
			assert.isFalse(dataTypes.boolean(''), 'Should fail to recognize "" as a boolean.');
			assert.isFalse(dataTypes.boolean('asdf'), 'Should fail to recognize "asdf" as a boolean.');
			assert.isFalse(dataTypes.boolean(null), 'Should fail to recognize null as a boolean.');
			assert.isFalse(dataTypes.boolean(undefined), 'Should fail to recognize undefined as a boolean.');
			assert.isFalse(dataTypes.boolean({}), 'Should fail to recognize {} as a boolean.');
			assert.isFalse(dataTypes.boolean([]), 'Should fail to recognize [] as a boolean.');
			assert.isFalse(dataTypes.boolean(new Date()), 'Should fail to recognize a date as a boolean.');
			done();
		});
	});

	describe('date data type', function () {
		it('should be recognized as a date', function (done) {
			assert.isTrue(dataTypes.date(new Date()), 'Should recognize a date as a date.');
			done();
		});

		it('should fail to be recognized as an boolean', function (done) {
			assert.isFalse(dataTypes.date(-100), 'Should fail to recognize -100 as a date.');
			assert.isFalse(dataTypes.date(0), 'Should fail to recognize 0 as a date.');
			assert.isFalse(dataTypes.date(100), 'Should fail to recognize 100 as a date.');
			assert.isFalse(dataTypes.date(-99.9), 'Should fail to recognize -99.9 as a date.');
			assert.isFalse(dataTypes.date(-99.1), 'Should fail to recognize -99.1 as a date.');
			assert.isFalse(dataTypes.date(-0.75), 'Should fail to recognize -0.75 as a date.');
			assert.isFalse(dataTypes.date(-0.25), 'Should fail to recognize -0.25 as a date.');
			assert.isFalse(dataTypes.date(0.25), 'Should fail to recognize 0.25 as a date.');
			assert.isFalse(dataTypes.date(0.75), 'Should fail to recognize 0.75 as a date.');
			assert.isFalse(dataTypes.date(99.1), 'Should fail to recognize 99.1 as a date.');
			assert.isFalse(dataTypes.date(99.9), 'Should fail to recognize 99.9 as a date.');
			assert.isFalse(dataTypes.date(''), 'Should fail to recognize "" as a date.');
			assert.isFalse(dataTypes.date('asdf'), 'Should fail to recognize "asdf" as a date.');
			assert.isFalse(dataTypes.date(null), 'Should fail to recognize null as a date.');
			assert.isFalse(dataTypes.date(undefined), 'Should fail to recognize undefined as a date.');
			assert.isFalse(dataTypes.date({}), 'Should fail to recognize {} as a date.');
			assert.isFalse(dataTypes.date([]), 'Should fail to recognize [] as a date.');
			assert.isFalse(dataTypes.date(true), 'Should recognize true as an date.');
			assert.isFalse(dataTypes.date(false), 'Should recognize false as an date.');
			done();
		});
	});
});
