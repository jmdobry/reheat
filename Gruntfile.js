module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	var dev = process.cwd().indexOf('/home/codetrain/reheat') === -1;

	grunt.initConfig({
		clean: {
			doc: ['doc/'],
			build: ['build/'],
			afterDoc: [
				'doc/resources/img/angular.png',
				'doc/resources/img/angular_grey.png',
				'doc/resources/img/AngularJS-small.png',
				'doc/resources/img/docular-small.png',
				'doc/resources/img/favicon.ico',
				'doc/resources/img/grunt.png',
				'doc/resources/img/grunt_grey.png',
				'doc/resources/img/node.png',
				'doc/resources/img/node_grey.png',
				'doc/resources/angular/',
				'doc/resources/doc_api_resources/doc_api.js',
				'doc/resources/js/docs*.js',
				'doc/resources/js/jquery*.js'
			]
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

		concat: {
			libs: {
				src: [
					'doc/resources/js/jquery.js',
					'doc/resources/js/jquery.goto.js',
					'doc/resources/js/jquery.cookie.js',
					'doc/resources/angular/angular.js',
					'doc/resources/angular/angular-bootstrap.js',
					'doc/resources/angular/angular-bootstrap-prettify.js',
					'doc/resources/angular/angular-cookies.js',
					'doc/resources/angular/angular-resource.js',
					'doc/resources/angular/angular-sanitize.js'

				],
				dest: 'doc/resources/js/libs.js'
			},
			scripts: {
				src: [
					'doc/resources/js/docs_module_begin.js',
					'guide/reheat.js',
					'doc/resources/doc_api_resources/doc_api.js',
					'doc/resources/js/docs_module_end.js',
					'doc/documentation/docs-metadata.js',
					'doc/documentation/groups-metadata.js',
					'doc/documentation/layout-metadata.js'

				],
				dest: 'doc/resources/js/scripts.js'
			},
			css: {
				src: [
					'doc/resources/css/bootstrap.min.css',
					'doc/resources/css/font-awesome.css',
					'doc/resources/css/docular.css',
					'doc/resources/css/custom.css',
					'doc/resources/doc_api_resources/doc_api.css',
					'guide/reheat.css'
				],
				dest: 'doc/resources/css/styles.css'
			}
		},

		uglify: {
			scripts: {
				files: {
					'doc/resources/js/libs.min.js': ['doc/resources/js/libs.js']
				}
			}
		},

		copy: {
			favicon: {
				expand: true,
				cwd: 'guide/',
				src: 'favicon.ico',
				dest: 'doc/',
				flatten: true
			},
			index: {
				expand: true,
				cwd: 'guide/',
				src: 'index.html',
				dest: 'doc/',
				flatten: true
			},
			flames95: {
				expand: true,
				cwd: 'guide/',
				src: 'flames95.png',
				dest: 'doc/resources/img/',
				flatten: true
			},
			cream_dust: {
				expand: true,
				cwd: 'guide/',
				src: 'cream_dust.png',
				dest: 'doc/resources/img/',
				flatten: true
			}
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
			unit: [
				'test/unit/**/*.test.js'
			],
			integration: [
				'test/integration/model/static/*.test.js'
			]
		},

		coveralls: {
			options: {
				coverage_dir: 'build/report'
			}
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
							docs: ['guide/connection/'],
							rank: {
								index: 1,
								overview: 2,
								options: 3,
								dynamic: 4
							}
						},
						{
							id: 'schema',
							title: 'Schema Guide',
							docs: ['guide/schema/'],
							rank: {
								index: 1,
								overview: 2,
								robocop: 3,
								rules: 4
							}
						},
						{
							id: 'model',
							title: 'Model Guide',
							docs: ['guide/model/'],
							rank: {
								index: 1,
								overview: 2,
								options: 3,
								instances: 4,
								lifecycle: 5,
								saving: 6
							}
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
			docular_partial_footer: 'guide/footer.html',
			analytics: {
				account: 'UA-46792694-4',
				domainName: 'reheat.codetrain.io'
			},
			discussions: {
				shortName: 'reheat',
				url: 'http://reheat.codetrain.io',
				dev: dev
			}
		}
	});

	grunt.registerTask('test-unit', [
		'nodeunit:unit'
	]);

	grunt.registerTask('test-integration', [
		'nodeunit:integration'
	]);

	var testTasks = [
		'clean:build',
		'instrument',
		'reloadTasks',
//		'test-unit',
		'test-integration',
		'storeCoverage',
		'makeReport'
	];

	if (process.env.TRAVIS === true || process.env.TRAVIS === 'true') {
		testTasks.push('coveralls');
	}
	grunt.registerTask('test', testTasks);

	grunt.registerTask('doc', ['clean:doc', 'docular', 'concat', 'copy', 'clean:afterDoc', 'uglify']);

	grunt.registerTask('build', [
		'jshint',
		'test'
	]);

	grunt.registerTask('default', [
		'build'
	]);
};
