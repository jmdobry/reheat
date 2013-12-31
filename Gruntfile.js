module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.initConfig({
		clean: {
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

	grunt.registerTask('build', [
		'jshint',
		'test'
	]);

	grunt.registerTask('default', [
		'build'
	]);
};
