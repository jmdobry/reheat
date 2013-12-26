module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.initConfig({
		clean: ['doc/', 'build/'],

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

		jsdoc: {
			dist: {
				src: ['lib/**/*.js', 'README.md'],
				options: {
					destination: 'doc/',
					plugins: [ 'plugins/markdown' ],
					markdown: {
						parser: 'marked'
					},
					tutorials: 'guide/',
					recurse: true,
					private: false
				}
			}
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
			files: ['test/unit/**/*.js' ]
		}
	});

	grunt.registerTask('test-unit', [
		'nodeunit'
	]);

	grunt.registerTask('test', [
		'test-unit'
	]);

	grunt.registerTask('build', [
		'clean',
		'jshint',
		'cover',
		'jsdoc'
	]);

	grunt.registerTask('default', [
		'build'
	]);

	grunt.registerTask('cover', ['clean', 'instrument', 'reloadTasks', 'test', 'storeCoverage', 'makeReport']);
};
