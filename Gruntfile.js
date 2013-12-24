module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.initConfig({
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

		mochaTest: {
			unit: {
				options: {
					reporter: 'dot'
				},
				src: ['test/support/support.js', 'test/unit/**/*.js']
			}
		},

		jsdoc: {
			dist: {
				src: ['lib/**/*.js', 'README.md'],
				options: {
					destination: 'doc/',
					plugins: [ 'plugins/markdown' ],
					markdown: {
						parser: 'gfm'
					}
				}
			}
		}
	});

	grunt.registerTask('test-unit', [
		'mochaTest:unit'
	]);

	grunt.registerTask('test', [
		'test-unit'
	]);

	grunt.registerTask('build', [
		'jshint',
		'test',
		'jsdoc'
	]);

	grunt.registerTask('default', [
		'build'
	]);
};
