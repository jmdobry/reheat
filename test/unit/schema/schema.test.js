'use strict';

var Schema = require('../../../lib/schema/index'),
	mout = require('mout');

describe('Schema', function () {

	describe('Schema constructor', function () {
		it('should validate name', function (done) {
			mout.collection.forEach(TYPES_EXCEPT_STRING, function (val) {
				try {
					var schema = new Schema(val, {});
					fail('should fail on ' + val);
				} catch (err) {
					assert.equal(err.message, 'Schema(name, schema): name: Must be a string!');
				}
			});
			try {
				var schema = new Schema('a string', {});
				assert.equal(schema.name, 'a string', 'Should set name correctly.');
			} catch (err) {
				fail('should not fail on a string.');
			}

			done();
		});

		it('validate schema', function (done) {
			mout.collection.forEach(TYPES_EXCEPT_OBJECT, function (val) {
				try {
					var schema = new Schema('name', val);
					fail('should fail on ' + val);
				} catch (err) {
					assert.equal(err.message, 'Schema(name, schema): schema: Must be an object!');
				}
			});
			try {
				var schema = new Schema('name', {});
				assert.deepEqual(schema.schema, {}, 'Should set schema correctly.');
			} catch (err) {
				fail('should not fail on an object.');
			}

			done();
		});
	});
});
