/*jshint loopfunc:true*/

var reheat = require('../../../build/instrument/lib/'),
	errors = require('../../../build/instrument/lib/support/errors'),
	support = require('../../support/support'),
	Connection = require('../../../build/instrument/lib/connection');

exports.index = {
	defineModel: function (test) {
		test.expect(42);

		for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						idAttribute: support.TYPES_EXCEPT_STRING[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		for (i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						tableName: support.TYPES_EXCEPT_STRING[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		for (i = 0; i < support.TYPES_EXCEPT_BOOLEAN.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						timestamps: support.TYPES_EXCEPT_BOOLEAN[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		for (i = 0; i < support.TYPES_EXCEPT_BOOLEAN.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						softDelete: support.TYPES_EXCEPT_BOOLEAN[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		test.throws(
			function () {
				reheat.defineModel('Post', {});
			},
			errors.IllegalArgumentError
		);

		var connection = new Connection();

		for (i = 0; i < support.TYPES_EXCEPT_BOOLEAN.length; i++) {
			if (!support.TYPES_EXCEPT_BOOLEAN[i]) {
				continue;
			}
			test.throws(
				function () {
					reheat.defineModel('Post', {
						schema: support.TYPES_EXCEPT_BOOLEAN[i],
						connection: connection
					});
				},
				errors.IllegalArgumentError
			);
		}
		test.doesNotThrow(
			function () {
				reheat.defineModel('Post', {
					connection: connection
				});
			}
		);

		reheat.unregisterModel('Post');

		test.done();
	}
};
