module.exports = function (container, assert) {
	return function () {

		it('returns the correct list of functions', function () {
			var Posts = container.get('Posts');

			var posts = new Posts();

			assert.deepEqual(posts.functions(), [
				'clone',
				'constructor',
				'every',
				'filter',
				'find',
				'findIndex',
				'findLast',
				'findLastIndex',
				'forEach',
				'functions',
				'getByPrimaryKey',
				'hasNew',
				'initialize',
				'invoke',
				'map',
				'pluck',
				'reduce',
				'reject',
				'remove',
				'reset',
				'shuffle',
				'size',
				'slice',
				'some',
				'sort',
				'sortBy',
				'split',
				'toJSON',
				'toLookup',
				'unique'
			]);
		});
	};
};
