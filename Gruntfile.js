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
//		},
//
//		shell: {
//			integration: {
//				options: {
//					stdout: true,
//					stderr: true,
//					failOnError: true,
//					execOptions: {
//						env: {
//							NODE_ENV: 'test'
//						}
//					}
//				},
//				command: 'node test/integration/runner.js'
//			},
//			load: {
//				options: {
//					stdout: true,
//					stderr: true,
//					failOnError: true
//				},
//				command: 'node ./node_modules/mocha/bin/mocha ./test/load/loadTest.js'
//			}
		}
	});

	grunt.registerTask('build', ['jshint']);

//	grunt.registerTask('test-integration', ['shell:integration']);
//	grunt.registerTask('test-load', ['shell:load']);
//	grunt.registerTask('test', ['build', 'test-integration', 'test-load']);

	grunt.registerTask('default', ['build']);
};