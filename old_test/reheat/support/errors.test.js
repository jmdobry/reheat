var errors = require('../../../../build/instrument/lib/support/errors');

exports.errors = {
	UnhandledError: {
		test: function (test) {
			test.expect(4);

			var err1 = new Error('message');
			var err2 = new errors.UnhandledError(err1);

			test.ok(err2 instanceof errors.UnhandledError);

			test.equal(err2.type, 'UnhandledError');
			test.equal(err2.message, 'UnhandledError: This is an uncaught exception. Please consider submitting an issue at https://github.com/jmdobry/reheat/issues.\n\n' +
				'Original Uncaught Exception: Error\n' + err1.stack.toString());

			test.deepEqual(err2.originalError, err1);

			test.done();
		}
	},
	IllegalArgumentError: {
		test: function (test) {
			test.expect(8);

			var err = new errors.IllegalArgumentError('message', { error: 'message' });
			var err2 = new errors.IllegalArgumentError();

			test.ok(err instanceof errors.IllegalArgumentError);
			test.ok(err2 instanceof errors.IllegalArgumentError);

			test.equal(err.type, 'IllegalArgumentError');
			test.equal(err2.type, 'IllegalArgumentError');
			test.equal(err.message, 'message');
			test.equal(err2.message, 'Illegal Argument!');

			test.deepEqual(err.errors, { error: 'message' });
			test.deepEqual(err2.errors, {});

			test.done();
		}
	},
	ValidationError: {
		test: function (test) {
			test.expect(8);

			var err = new errors.ValidationError('message', { error: 'message' });
			var err2 = new errors.ValidationError();

			test.ok(err instanceof errors.ValidationError);
			test.ok(err2 instanceof errors.ValidationError);

			test.equal(err.type, 'ValidationError');
			test.equal(err2.type, 'ValidationError');
			test.equal(err.message, 'message');
			test.equal(err2.message, 'Validation Error!');

			test.deepEqual(err.errors, { error: 'message' });
			test.deepEqual(err2.errors, {});

			test.done();
		}
	}
};
