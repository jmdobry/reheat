'use strict';

module.exports = {

	save: function save(attrs, cb) {
		cb(null, attrs, { created: 1 });
	},

	destroy: function destroy(attrs, cb) {
		cb(null, attrs, { deleted: 1 });
	}
};
