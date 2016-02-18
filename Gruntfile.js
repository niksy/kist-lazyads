module.exports = function ( grunt ) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		meta: {
			banner: '/*! <%= pkg.name %> <%= pkg.version %> - <%= pkg.description %> | Author: <%= pkg.author %>, <%= grunt.template.today("yyyy") %> | License: <%= pkg.license %> */\n'
		},

		concat: {
			dist: {
				options: {
					stripBanners: true,
					banner: '<%= meta.banner %>'
				},
				files: {
					'dist/<%= pkg.name %>.js': ['compiled/<%= pkg.main %>']
				}
			}
		},

		uglify: {
			dist: {
				options: {
					banner: '<%= meta.banner %>'
				},
				files: {
					'dist/<%= pkg.name %>.min.js': ['compiled/<%= pkg.main %>']
				}
			}
		},

		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: ['pkg'],
				commit: true,
				commitMessage: 'Release %VERSION%',
				commitFiles: ['-a'],
				createTag: true,
				tagName: '%VERSION%',
				tagMessage: '',
				push: false
			}
		},

		jshint: {
			main: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: [
					'<%= pkg.main %>',
					'lib/**/*.js'
				]
			}
		},

		browserify: {
			options: {
				browserifyOptions: {
					standalone: 'jQuery.kist.Lazyads'
				}
			},
			standalone: {
				options: {
					plugin: ['bundle-collapser/plugin']
				},
				files: {
					'compiled/<%= pkg.main %>': ['<%= pkg.main %>']
				}
			}
		},

		connect: {
			test:{
				options: {
					open: true
				}
			}
		},

		'compile-handlebars': {
			test: {
				templateData: {
					bower: '../../../bower_components',
					compiled: '../../../compiled',
					assets: 'assets',
					main: '<%= pkg.main %>'
				},
				partials: 'test/manual/templates/partials/**/*.hbs',
				template: 'test/manual/templates/*.hbs',
				output: 'compiled/test/manual/*.html'
			}
		},

		copy: {
			test: {
				files:[{
					expand: true,
					cwd: 'test/manual/assets/',
					src: ['**'],
					dest: 'compiled/test/manual/assets/'
				}]
			}
		},

		concurrent: {
			options: {
				logConcurrentOutput: true
			},
			test: ['watch','connect:test:keepalive']
		},

		watch: {
			options: {
				spawn: false
			},
			hbs: {
				files: 'test/manual/**/*.hbs',
				tasks: ['compile-handlebars:test']
			},
			browserify: {
				files: ['<%= pkg.main %>', 'lib/**/*.js'],
				tasks: ['browserify:standalone']
			}
		},

		karma: {
			test: {
				configFile: 'karma.conf.js'
			}
		},

		'update_json': {
			options: {
				indent: '  '
			},
			bower: {
				src: 'package.json',
				dest: 'bower.json',
				fields: 'version'
			}
		}

	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('test', function () {
		var tasks = ['compile-handlebars:test','copy:test','browserify:standalone'];
		if ( grunt.option('watch') ) {
			tasks.push('concurrent:test');
		} else {
			tasks.push('karma:test');
		}
		grunt.task.run(tasks);
	});

	grunt.registerTask('lint', ['jshint:main']);
	grunt.registerTask('build', ['browserify:standalone', 'concat', 'uglify']);

};
