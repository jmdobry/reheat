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
							id: 'guide',
							title:'Guide',
							scripts: ['guide/']
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
							title:'Reheat',
							scripts: ['lib/connection/index.js', 'lib/support/errors.js']
						}
					]
				},
				{
					groupTitle: 'Community',
					groupId: 'Community',
					groupIcon: 'icon-group',
					sections: [
						{
							id: 'mailinglist',
							title:'Mailing List',
							link: 'https://groups.google.com/forum/?fromgroups#!forum/reheat'
						},
						{
							id: 'issues',
							title:'Issues',
							link: 'https://github.com/jmdobry/reheat/issues'
						},
						{
							id: 'github',
							title:'GitHub',
							link: 'https://github.com/jmdobry/reheat'
						}
					]
				}
			],
			docular_webapp_target : 'doc',
			showDocularDocs: true,
			showAngularDocs: false
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
