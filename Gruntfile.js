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

		shell: {
			unit: {
				options: {
					stdout: true,
					stderr: false,
					failOnError: true,
					execOptions: {
						env: {
							NODE_ENV: 'test'
						}
					}
				},
				command: 'node test/unit/runner.js'
			}
		}
	});

	grunt.registerTask('build', ['jshint']);

	grunt.registerTask('test-unit', ['shell:unit']);
//	grunt.registerTask('test-load', ['shell:load']);
//	grunt.registerTask('test', ['build', 'test-integration', 'test-load']);

	grunt.registerTask('default', ['build']);
};