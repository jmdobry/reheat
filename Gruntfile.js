module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.initConfig({
		clean: {
			doc: ['doc/'],
			build: ['build/']
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'lib/**/*.js',
				'test/**/*.js'
			]
		},

		instrument: {
			files: 'lib/**/*.js',
			options: {
				lazy: true,
				basePath: 'build/instrument/'
			}
		},

		reloadTasks: {
			rootPath: 'build/instrument/lib'
		},

		storeCoverage: {
			options: {
				dir: 'build/report'
			}
		},

		makeReport: {
			src: 'build/report/*.json',
			options: {
				type: 'lcov',
				dir: 'build/report',
				print: 'detail'
			}
		},

		nodeunit: {
			unit: ['test/unit/**/*.js'],
			integration: ['test/integration/**/*.js']
		},

		docular: {
			groups: [
				{
					groupTitle: 'Guide',
					groupId: 'guide',
					groupIcon: 'icon-book',
					sections: [
						{
							id: 'overview',
							title: 'Overview',
							docs: ['guide/overview/'],
							rank: {
								index: 1,
								connections: 2,
								schemas: 3,
								models: 4
							}
						},
						{
							id: 'connection',
							title: 'Connection Guide',
							docs: ['guide/connection/']
						},
						{
							id: 'schema',
							title: 'Schema Guide',
							docs: ['guide/schema/']
						},
						{
							id: 'model',
							title: 'Model Guide',
							docs: ['guide/model/']
						}
					]
				},
				{
					groupTitle: 'API',
					groupId: 'api',
					groupIcon: 'icon-wrench',
					showSource: true,
					sections: [
						{
							id: 'api',
							title: 'Reheat',
							scripts: [
								'lib/connection/index.js',
								'lib/support/errors.js',
								'lib/model/'
							],
							docs: ['guide/api']
						}
					]
				}
			],
			docular_webapp_target: 'doc',
			showDocularDocs: false,
			showAngularDocs: false,
			docular_partial_home: 'guide/home.html',
			docular_partial_navigation: 'guide/nav.html',
			docular_partial_footer: 'guide/footer.html'
		}
	});

	grunt.registerTask('test-unit', [
		'nodeunit:unit'
	]);

	grunt.registerTask('test-integration', [
		'nodeunit:integration'
	]);

	grunt.registerTask('test', [
		'clean:build',
		'instrument',
		'reloadTasks',
		'test-unit',
		'test-integration',
		'storeCoverage',
		'makeReport'
	]);

	grunt.registerTask('doc', ['clean:doc', 'docular']);
	grunt.registerTask('docserve', ['clean:doc', 'docular', 'docular-server']);

	grunt.registerTask('build', [
		'jshint',
		'test',
		'doc'
	]);

	grunt.registerTask('default', [
		'build'
	]);
};
