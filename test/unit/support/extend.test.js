var extend = require('../../../build/instrument/lib/support/extend');

exports.extendTest = {
	simple: function (test) {
		test.expect(7);

		function Parent(stuff) {
			this.stuff = stuff;
		}

		Parent.extend = extend;

		var Child = Parent.extend({
			protoProp: 'protoString',
			protoMethod: function () {
				return 'protoMethodResult';
			}
		}, {
			staticProp: 'staticString',
			staticMethod: function () {
				return 'staticMethodResult';
			}
		});

		var child = new Child('stuff');

		test.equal(child.stuff, 'stuff');
		test.equal(child.protoProp, 'protoString');
		test.equal(child.protoMethod(), 'protoMethodResult');

		test.equal(child.staticProp, undefined);
		test.equal(child.staticMethod, undefined);

		test.equal(Child.staticProp, 'staticString');
		test.equal(Child.staticMethod(), 'staticMethodResult');


		test.done();
	},
	noProto: function (test) {
		test.expect(5);

		function Parent(stuff) {
			this.stuff = stuff;
		}

		Parent.extend = extend;

		var Child = Parent.extend(null, {
			staticProp: 'staticString',
			staticMethod: function () {
				return 'staticMethodResult';
			}
		});

		var child = new Child('stuff');

		test.equal(child.stuff, 'stuff');

		test.equal(child.staticProp, undefined);
		test.equal(child.staticMethod, undefined);

		test.equal(Child.staticProp, 'staticString');
		test.equal(Child.staticMethod(), 'staticMethodResult');


		test.done();
	}
};
