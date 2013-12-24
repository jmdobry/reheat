'use strict';
module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	var config = {
		lib: 'lib',
		test: 'test'
	};

	grunt.initConfig({
		config: config,
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= config.lib %>/{,*/}*.js',
				'<%= config.test %>/{,*/}*.js'
			]
		},

		mochaTest: {
			unit: {
				options: {
					reporter: 'dot'
				},
				src: ['test/support/support.js', 'test/unit/**/*.js']
			}
		}
	});

	grunt.registerTask('test-unit', ['mochaTest:unit']);
	grunt.registerTask('test', ['test-unit']);
	grunt.registerTask('build', ['jshint', 'test']);

	grunt.registerTask('default', ['build']);
};
