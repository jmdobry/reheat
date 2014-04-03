module.exports = function () {

	// Mock "r" (rethinkdb)
	return {
		table: function () {
			return this;
		},
		filter: function () {
			return this;
		},
		orderBy: function () {
			return this;
		},
		limit: function () {
			return this;
		},
		skip: function () {
			return this;
		},
		pluck: function () {
			return this;
		}
	};
};
