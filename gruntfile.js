module.exports = function(grunt) {

    var _ = require('lodash');
    var fs = require('fs');

    // Load required Grunt tasks. These are installed based on the versions listed
    // * in 'package.json' when you do 'npm install' in this directory.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-ngmin');
    grunt.loadNpmTasks('grunt-html2js');
    //grunt.loadNpmTasks('grunt-ts');
    

    /** ********************************************************************************* */
    /** **************************** File Config **************************************** */
    var fileConfig = {
        build_dir: 'build',
        gen_dir: 'src-gen',
        compile_dir: '../public',
        api_dir: '../../renewals-api/src/main/java/com/metlife/us/ins/ar/',
        /**
         * This is a collection of file patterns for our app code (the
         * stuff in 'src/'). These paths are used in the configuration of
         * build tasks. 'js' is all project javascript, except tests.
         * 'commonTemplates' contains our reusable components' ('src/common')
         * template HTML files, while 'appTemplates' contains the templates for
         * our app's code. 'html' is just our main HTML file. 'less' is our main
         * stylesheet, and 'unit' contains our app's unit tests.
         */
        app_files: {
            js: [   'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js', '!src/**/*.mock.js' ],
            jsGen: [ '**/*.js', '!**/*.spec.js', '!assets/**/*.js', '!**/*.mock.js' ], // src-gen relative            
            jsunit: [ 'src/**/*.spec.js', 'src/**/*.mock.js', '<%= gen_dir %>/**/*.spec.js', '<%= gen_dir %>/**/*.mock.js' ],
            appTemplates: [ 'app/**/*.tpl.html' ],
            commonTemplates: [ 'app/common/**/*.tpl.html' ],
            html: [ 'app/index.html' ],
            less: [ 'assets/less/**/*.less' ],
            css: [ 'assets/sass/**/*.scss' ]
        },

        /**
         * This is a collection of files used during testing only.
         */
        test_files: {
            js: [
                'vendor/angular-mocks/angular-mocks.js',
                'vendor/sinonjs/sinon.js'
            ]
        },

        /**
         * This is the same as 'app_files', except it contains patterns that
         * reference vendor code ('vendor/') that we need to place into the build
         * process somewhere. While the 'app_files' property ensures all
         * standardized files are collected for compilation, it is the user's job
         * to ensure non-standardized (i.e. vendor-related) files are handled
         * appropriately in 'vendor_files.js'.
         *
         * The 'vendor_files.js' property holds files to be automatically
         * concatenated and minified with our project source files.
         *
         * The 'vendor_files.css' property holds any CSS files to be automatically
         * included in our app.
         *
         * The 'vendor_files.assets' property holds any assets to be copied along
         * with our app's assets. This structure is flattened, so it is not
         * recommended that you use wildcards.
         */
        vendor_files: {
            js: [

                //  These files need to be in this order.  Do not change it.
                //  These are the original files and will NOT use bower.
                // ES5 shims needed for our build server because of https://github.com/ariya/phantomjs/issues/10522
                'vendor/es5-shim/es5-shim.min.js',
                'vendor/es5-shim/es5-sham.min.js',
                'vendor/jquery/jquery.js',
                'vendor/jqgrid/js/minified/jquery.jqGrid.min.js',
                'vendor/jqgrid/js/i18n/grid.locale-en.js',
                'vendor/html5shiv/dist/html5shiv.js',
                'vendor/respond/dest/respond.min.js',
                'vendor/bootstrap/dist/js/bootstrap.min.js',
                'vendor/select2/select2.js',
                'vendor/angular/angular.js',
                'vendor/angular-ui-router/release/angular-ui-router.js',
                'vendor/angular-sanitize/angular-sanitize.js',
                'vendor/angular-resource/angular-resource.js',
                'vendor/angular-ui-select2/src/select2.js',
                'vendor/async/lib/async.js',
                'vendor/moment/min/moment.min.js',
                'vendor/angular-upload/angular-upload.js',

                //  Not in original list.
                'vendor/ng-percentage-filter/src/percentage.filter.js',
                'vendor/datatables/media/js/jquery.dataTables.js',
                'vendor/jeditable/jquery.jeditable.js',
                'vendor/jquery-layout/dist/jquery.layout-latest.min.js',
                'vendor/jQuery-contextMenu/src/jquery.contextMenu.js',
                'vendor/jquery-ui/jquery-ui.min.js',
                'vendor/big.js/big.min.js',
                'vendor/lodash/dist/lodash.min.js',
                'vendor/underscore.string/dist/underscore.string.min.js',
                'vendor/xml-json/xml2json.js',
                //  Include all lib files.  May have to manually move some of these up higher
                //  if ever they have dependency clashes with any of the vendor files above.
                //  Note that the following files were manually modified and should not be
                //  converted to vendor/bower dependencies:
                //      - ui-bootstrap-0.11.custom.min.js
                //      - ng-table.js
                'lib/*.js'
                ],
            css: [
                'vendor/bootstrap/dist/css/bootstrap.min.css',
                'vendor/components-font-awesome/css/font-awesome.min.css',
            ],
            assets: [
                //'vendor/bootstrap/dist/fonts/*.*',
            ],
            fonts: [
                'vendor/bootstrap/dist/fonts/*.*',
                'vendor/components-font-awesome/fonts/*.*',
            ]
        }
    };

    /** ********************************************************************************* */
    /** **************************** Task Config **************************************** */
    var taskConfig = {
        pkg: grunt.file.readJSON("package.json"),

        /**
         * The banner is the comment that is placed at the top of our compiled
         * source files. It is first processed as a Grunt template, where the '<%='
         * pairs are evaluated based on this very configuration object.
         */
        meta: {
            banner:
                '/**\n' +
                    ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    ' *\n' +
                    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                    ' */\n'
        },

        /**
         * The directories to delete when 'grunt clean' is executed.
         */
        clean: {
            options: { force: true }, // Because we are cleaning outside of the grunt working directory
            build: [ '<%= build_dir %>', '<%= gen_dir %>' ],
            compile: [ '<%= compile_dir %>' ]
        },

        /**
         * The 'copy' task just copies files from A to B. We use it here to copy
         * our project assets (images, fonts, etc.) and javascripts into
         * 'build_dir', and then to copy the assets to 'compile_dir'.
         */
        copy: {
            build_app_assets: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= build_dir %>/assets/',
                        cwd: 'src/assets',
                        expand: true
                    }
                ]
            },

            build_vendor_assets: {
                files: [
                    {
                        src: [ '<%= vendor_files.assets %>' ],
                        dest: '<%= build_dir %>',
                        cwd: '.',
                        expand: true
                        //  We don't flatten here because the files need to be in their original
                        //  locations (e.g. - fonts to use with bootstrap.
                        //flatten: false
                    }
                ]
            },

            build_vendor_fonts: {
                files: [
                    {
                        src: [ '<%= vendor_files.fonts %>' ],
                        //dest: '<%= build_dir %>/fonts/',
                        dest: '<%= build_dir %>',
                        cwd: '.',
                        expand: true,
                        //flatten: true
                    }
                ]
            },

            build_appjs: {
                files: [
                    {
                        src: [ '<%= app_files.js %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }, {
                        src: [ '<%= app_files.jsGen %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '<%= gen_dir %>/',
                        expand: true
                    }
                ]
            },
            build_vendorjs: {
                files: [
                    {
                        src: [ '<%= vendor_files.js %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            build_appcss: {
                files: [
                    {
                        src: [ '<%= app_files.css %>'],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            build_test: {
                files: [
                    {
                        src: [ '<%= app_files.jsunit %>'],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            build_vendorcss: {
                files: [
                    {
                        src: [ '<%= vendor_files.css %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            compile_assets: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= compile_dir %>/assets',
                        cwd: '<%= build_dir %>/assets',
                        expand: true
                    }
                ]
            },
            publish_build: {
                files: [
                    {
                        src: [ '<%= build_dir %>/**' ],
                        dest: '<%= compile_dir %>',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
        },

        ts: {
            options: {
                module: 'amd',
                target: 'es5'
            },
            build: {
                src: ['<%= app_files.ts %>' ],
                // later copied to build dir and run through usual js stuff (ngmin, uglify, concat)
                outDir: '<%= gen_dir %>/',
                //out: '<%= build_dir %>/src/app/tsout.js',
                //watch: 'src',
                reference: '<%= gen_dir %>/reference-tsc.ts',
                options: {
                    sourceMap: true,
                    declaration: false,
                    removeComments: false
                }
            }
        },

        /**
         * 'grunt concat' concatenates multiple source files into a single file.
         */
        concat: {
            // The 'build_css' target concatenates compiled CSS and vendor CSS together.
            build_css: {
                src: [
                    //'<%= vendor_files.css %>',
                    '<%= recess.build.dest %>'
                ],
                dest: '<%= recess.build.dest %>'
            },
            // The 'compile_js' target concatenates app and vendor js code together.
            compile_js: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                src: [
                    '<%= vendor_files.js %>',
                    'module.prefix',
                    '<%= build_dir %>/src/**/*.js',
                    '<%= html2js.app.dest %>',
                    '<%= html2js.common.dest %>',
                    'module.suffix'
                ],
                dest: '<%= compile_dir %>/assets/mainApp-<%= pkg.version %>.js'
            }
        },

        /**
         * 'ng-min' annotates the sources before minifying. That is, it allows us
         * to code without the array syntax.
         */
        ngmin: {
            compile: {
                files: [
                    {
                        src: [ '<%= app_files.js %>' ],
                        cwd: '<%= build_dir %>',
                        dest: '<%= build_dir %>',
                        expand: true
                    }
                ]
            }
        },

        /**
         * Minify the sources!
         */
        uglify: {
            compile: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: {
                    '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
                }
            }
        },

        /**
         * 'recess' handles our LESS compilation and uglification automatically.
         * Only our 'main.less' file is included in compilation; all other files
         * must be imported from this file.
         */
        recess: {
            build: {
                src: [ '<%= app_files.less %>' ],
                dest: '<%= build_dir %>/assets/mainApp-<%= pkg.version %>.css',
                options: {
                    compile: true,
                    compress: false,
                    noUnderscores: false,
                    noIDs: false,
                    zeroUnits: false
                }
            },
            compile: {
                src: [ '<%= recess.build.dest %>' ],
                dest: '<%= recess.build.dest %>',
                options: {
                    compile: true,
                    compress: true,
                    noUnderscores: false,
                    noIDs: false,
                    zeroUnits: false
                }
            }
        },

        /**
         * 'jshint' defines the rules of our linter as well as which files we
         * should check. This file, all javascript sources, and all our unit tests
         * are linted based on the policies listed in 'options'. But we can also
         * specify exclusionary patterns by prefixing them with an exclamation
         * point (!); this is useful when code comes from a third party but is
         * nonetheless inside 'src/'.
         */
        jshint: {
            src: [
                '<%= app_files.js %>'
            ],
            test: [
                '<%= app_files.jsunit %>', '!<%= gen_dir %>/**/*'
            ],
            gruntfile: [
                'Gruntfile.js'
            ],
            options: {
                curly: true,
                immed: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true
            },
            globals: {}
        },

        // TODO tslint

        /**
         * HTML2JS is a Grunt plugin that takes all of your template files and
         * places them into JavaScript files as strings that are added to
         * AngularJS's template cache. This means that the templates too become
         * part of the initial payload as one JavaScript file. Neat!
         */
        html2js: {
            // These are the templates from 'src/app'.
            app: {
                options: {
                    base: 'src/app'
                },
                src: [ '<%= app_files.appTemplates %>' ],
                dest: '<%= build_dir %>/templates-app.js'
            },

            // These are the templates from 'src/common'.
            common: {
                options: {
                    base: 'src/common'
                },
                src: [ '<%= app_files.commonTemplates %>' ],
                dest: '<%= build_dir %>/templates-common.js'
            }
        },

        /**
         * The 'index' task compiles the 'index.html' file as a Grunt template. CSS
         * and JS files co-exist here but they get split apart later.
         */
        index: {

            /**
             * During development, we don't want to have wait for compilation,
             * concatenation, minification, etc. So to avoid these steps, we simply
             * add all script files directly to the '<head>' of 'index.html'. The
             * 'src' property contains the list of included files.
             */
            build: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= build_dir %>/src/**/*.js',
                    '<%= build_dir %>/src/**/*.css',
                    '<%= html2js.common.dest %>',
                    '<%= html2js.app.dest %>',
                    '<%= vendor_files.css %>',
                    '<%= recess.build.dest %>'
                ]
            },

            /**
             * When it is time to have a completely compiled application, we can
             * alter the above to include only a single JavaScript and a single CSS
             * file. Now we're back!
             */
            compile: {
                dir: '<%= compile_dir %>',
                src: [
                    '<%= concat.compile_js.dest %>',
                    '<%= vendor_files.css %>',
                    '<%= recess.compile.dest %>'
                ]
            }
        },

        /**
         * The Karma configurations.
         */
        karma: {
            options: {
                configFile: '<%= build_dir %>/karma-unit.js'
            },
            unit: {
                runnerPort: 9101,
                background: true
            },
            continuous: {
                singleRun: true
            },
            debug: {
                singleRun: false
            }
        },

        /**
         * This task compiles the karma template so that changes to its file array
         * don't have to be managed manually.
         */
        karmaconfig: {
            unit: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= html2js.app.dest %>',
                    '<%= html2js.common.dest %>',
                    '<%= test_files.js %>'
                ]
            }
        },

        /**
         * And for rapid development, we have a watch set up that checks to see if
         * any of the files listed below change, and then to execute the listed
         * tasks when they do. This just saves us from having to type "grunt" into
         * the command-line every time we want to see what we're working on; we can
         * instead just leave "grunt watch" running in a background terminal. Set it
         * and forget it, as Ron Popeil used to tell us.
         *
         * But we don't need the same thing to happen for all the files.
         */
        delta: {
            /**
             * By default, we want the Live Reload to work for all tasks; this is
             * overridden in some tasks (like this file) where browser resources are
             * unaffected. It runs by default on port 35729, which your browser
             * plugin should auto-detect.
             */
            options: {
                livereload: true,
                spawn: false,
                interval: 1000  
            },

            /**
             * When the Gruntfile changes, we just want to lint it. In fact, when
             * your Gruntfile changes, it will automatically be reloaded!
             */
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: [ 'jshint:gruntfile', 'unlock' ],
                options: {
                    livereload: false
                }
            },

            /**
             * When our JavaScript source files change, we want to run lint them and
             * run our unit tests.
             */
            jssrc: {
                files: [
                    '<%= app_files.js %>'
                ],
                tasks: [ 'jshint:src', 'karma:unit:run', 'copy:build_appjs', 'unlock' ]
            },

            /**
             * Ditto for TypeScript
             */
            tssrc: {
                files: [
                    '<%= app_files.ts %>'
                ],
                // XXX why jssrc runs unit test before copying files ??
                tasks: [ 'ts:build', 'karma:unit:run', 'copy:build_appjs', 'unlock' ]
            },


            /**
             * When assets are changed, copy them. Note that this will *not* copy new
             * files, so this is probably not very useful.
             */
            assets: {
                files: [
                    'src/assets/**/*'
                ],
                tasks: [ 'copy:build_app_assets', 'unlock' ]
            },

            /**
             * When index.html changes, we need to compile it.
             */
            html: {
                files: [ '<%= app_files.html %>' ],
                tasks: [ 'index:build', 'unlock' ]
            },

            /**
             * When our templates change, we only rewrite the template cache.
             */
            tpls: {
                files: [
                    '<%= app_files.appTemplates %>',
                    '<%= app_files.commonTemplates %>'
                ],
                tasks: [ 'html2js', 'unlock' ]
            },

            /**
             * When the CSS files change, we need to compile and minify them.
             */
            less: {
                files: [ 'src/**/*.less' ],
                tasks: [ 'recess:build', 'unlock' ]
            },


            css: {
                files: [
                    'src/**/*.css'
                ],
                tasks: [ 'copy:build_appcss', 'unlock' ]
            },

            /**
             * When a JavaScript unit test file changes, we only want to lint it and
             * run the unit tests. We don't want to do any live reloading.
             */
            jsunit: {
                files: [
                    '<%= app_files.jsunit %>'
                ],
                tasks: [ 'jshint:test', 'karma:unit:run', 'unlock' ],
                options: {
                    livereload: false
                }
            }
        },
        delta_nt: {
            /**
             * By default, we want the Live Reload to work for all tasks; this is
             * overridden in some tasks (like this file) where browser resources are
             * unaffected. It runs by default on port 35729, which your browser
             * plugin should auto-detect.
             */
            options: {
                livereload: true,
                spawn: false,
                interval: 1000
            },

            /**
             * When the Gruntfile changes, we just want to lint it. In fact, when
             * your Gruntfile changes, it will automatically be reloaded!
             */
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: [ 'jshint:gruntfile', 'unlock' ],
                options: {
                    livereload: false
                }
            },

            /**
             * When our JavaScript source files change, we want to run lint them and
             * run our unit tests.
             */
            jssrc: {
                files: [
                    '<%= app_files.js %>'
                ],
                tasks: [ 'jshint:src', 'copy:build_appjs' ]
            },

            /**
             * Ditto for TypeScript
             */
            tssrc: {
                files: [
                    '<%= app_files.ts %>'
                ],
                // ts plugin has builtin watch that's faster but I don't know how to integrate it
                tasks: [ 'ts:build', 'copy:build_appjs' ]
            },

            /**
             * When assets are changed, copy them. Note that this will *not* copy new
             * files, so this is probably not very useful.
             */
            assets: {
                files: [
                    'src/assets/**/*'
                ],
                tasks: [ 'copy:build_app_assets' ]
            },

            /**
             * When index.html changes, we need to compile it.
             */
            html: {
                files: [ '<%= app_files.html %>' ],
                tasks: [ 'index:build' ]
            },

            /**
             * When our templates change, we only rewrite the template cache.
             */
            tpls: {
                files: [
                    '<%= app_files.appTemplates %>',
                    '<%= app_files.commonTemplates %>'
                ],
                tasks: [ 'html2js' ]
            },

            /**
             * When the CSS files change, we need to compile and minify them.
             */
            less: {
                files: [ 'src/**/*.less' ],
                tasks: [ 'recess:build' ]
            },


            css: {
                files: [
                    'src/**/*.css'
                ],
                tasks: [ 'copy:build_appcss' ]
            },

            /**
             * When a JavaScript unit test file changes, we only want to lint it and
             * run the unit tests. We don't want to do any live reloading.
             */
            jsunit: {
                files: [
                    '<%= app_files.jsunit %>'
                ],
                tasks: [ 'jshint:test' ],
                options: {
                    livereload: false
                }
            }
        },
        test: {
            continuous: {
                tasks: [ 'karmaconfig', 'karma:continuous' ]
            },
            debug: {
                tasks: [ 'karmaconfig', 'karma:debug' ]
            }
        },
        check_quality: {
            src: {
                tasks: [ 'jshint:src' ]
            },
            test: {
                tasks: [ 'jshint:test' ]
            }
        },
        enums: {
            generator: {
                debug : false, //will generate a *.json file from java enums for debuging
                src: ['<%= api_dir %>enums/**/*.java'],
                dest: {
                    js : 'src/app/common/services/enumService.js',
                    ts : 'src/app/common/services/enumService.d.ts',
                    //TODO: this should probably be part of renewals-api somehow
                    sql : '../../renewals-api/src/test/resources/db/data/task1/' 
                }
            }
        }
    };



    /** ********************************************************************************* */
    /** **************************** Project Configuration ****************************** */
    grunt.initConfig(_.extend(taskConfig, fileConfig));


    // ----------=================================================================----------
    //                                 Development Tasks


    // In order to make it safe to just compile or copy *only* what was changed, we need to ensure we are starting from
    // a clean, fresh build. So we rename the 'watch' task to 'delta' (that's why the configuration var above is
    // 'delta') and then add a new task called 'watch' that does a clean build before watching for changes.
    grunt.renameTask('watch', 'delta');

    // Load the watch task again so we can customize it to run without
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.renameTask('watch', 'delta_nt');
    grunt.registerTask('watch-nt', [ 'build-nt', 'delta_nt' ]);

    grunt.registerTask('watch', [ 'build', 'karma:unit', 'unlock', 'delta' ]);

    // The default task is to build.
    grunt.registerTask('default', [ 'build' ]);

    // The 'build' task gets your app ready to run for development and testing.
    grunt.registerTask('build', [
        'enums:generator', 'clean', 'check_quality', 'html2js', 'ts:build', 'recess:build', 'concat:build_css',
        'copy:build_app_assets', 'copy:build_vendor_assets', 'copy:build_vendor_fonts',
        'copy:build_appjs', 'copy:build_vendorjs', 'copy:build_appcss', 'copy:build_vendorcss', 'index:build', 'test:continuous'
    ]);
    
    grunt.registerTask('build-nt', [
        'enums:generator', 'clean', 'check_quality', 'html2js', 'ts:build', 'recess:build', 'concat:build_css',
        'copy:build_app_assets', 'copy:build_vendor_assets',  'copy:build_vendor_fonts',
        'copy:build_appjs', 'copy:build_vendorjs', 'copy:build_appcss', 'copy:build_vendorcss', 'index:build', 'karmaconfig'
    ]);

    grunt.registerTask('build-fast', [
        'check_quality:src', 'copy:build_appjs'
    ]);

    // The 'build' task gets your app ready to run for development and testing.
    grunt.registerTask('testdebug', [
        'enums:generator', 'clean', 'html2js', 'ts:build', 'recess:build', //'concat:build_css',
        'copy:build_app_assets', 'copy:build_vendor_assets', 'copy:build_vendor_fonts',
        'copy:build_appjs', 'copy:build_vendorjs', 'copy:build_appcss', 'copy:build_vendorcss', 'copy:build_test',
        'index:build', 'test:debug'
    ]);


    // This is a more human-readable name for the test tasks, with the option of skipping them
    grunt.registerMultiTask('test', 'Might run the test cases, if no flag is given.', function () {
        if (!grunt.option('noTest')) {
            grunt.task.run(this.data.tasks);
        } else {
            grunt.log.writeln('Skipping tests');
        }
    });

    // This is a more human-readable name for the linter task, with the option of skipping it
    grunt.registerMultiTask('check_quality', 'Might run the linter, if no flag is given.', function () {
        if (!grunt.option('noLinter')) {
            grunt.task.run(this.data.tasks);
        } else {
            grunt.log.writeln('Skipping linter');
        }
    });


     // ----------=================================================================----------
    //                                 Production Tasks

    // This single task should do everything to prepare assets in the /public folder for Play running in production mode
    grunt.registerTask('dist', [ 'build', 'copy:publish_build', 'clean:build']);

    // The 'compile' task gets your app ready for deployment by concatenating and minifying your code.
    // TODO: Get the app working w/ this
    // TODO remove/exclude *.ts and *.js.map
    grunt.registerTask('compile', [
        //'recess:compile', 'copy:compile_assets', 'ngmin', 'concat:compile_js', 'uglify', 'index:compile'
        'recess:compile', 'copy:compile_assets', 'concat:compile_js', 'uglify', 'index:compile' // taking out ngmin until I figure out how to get it to work with enclosures
    ]);

    // A utility function to get all app JavaScript sources.
    function filterForJS (files) {
        return files.filter(function (file) {
            return file.match(/\.js$/);
        });
    }

    /**
     * Ensures that there is a proper ordering.
     * 1. Vendor files
     * 2. app.js
     * 3. others
     */
    function orderJs(files) {
        var order = [
            /vendor/,   //  then bower dependencies...
            /lib/,      //  3rd party libraries (not managed by bower)...
            /app\.js$/  //  then files finishing with app.js
        ];
        var orderedFiles = [];

        // Add those defined in the order
        order.forEach(function (regex) {
            [].push.apply(orderedFiles, files.filter(function (file) {
                return file.match(regex);
            }));
        });

        // Add the rest
        files.forEach(function (file) {
            if (orderedFiles.indexOf(file) === -1) {
                orderedFiles.push(file);
            }
        });
        return orderedFiles;
    }

    // A utility function to get all app CSS sources.
    function filterForCSS (files) {
        return files.filter( function (file) {
            return file.match(/\.css$/);
        });
    }

    // The index.html template includes the stylesheet and javascript sources
    // based on dynamic names calculated in this Gruntfile. This task assembles
    // the list into variables for the template to use and then runs the
    // compilation.
    grunt.registerMultiTask('index', 'Process index.html template', function () {
        var dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g');

        // this.fileSrc comes from either build:src, compile:src, or karmaconfig:src in the index config defined above
        // see - http://gruntjs.com/api/inside-tasks#this.filessrc for documentation
        var jsFiles = orderJs(filterForJS(this.filesSrc).map(function (file) {
            return file.replace(dirRE, '');
        }));
        var cssFiles = filterForCSS(this.filesSrc).map(function (file) {
            return file.replace(dirRE, '');
        });

        // this.data.dir comes from either build:dir, compile:dir, or karmaconfig:dir in the index config defined above
        // see - http://gruntjs.com/api/inside-tasks#this.data for documentation
        grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
            process: function (contents, path) {
                // These are the variables looped over in our index.html exposed as "scripts", "styles", and "version"
                return grunt.template.process(contents, {
                    data: {
                        scripts: jsFiles,
                        styles: cssFiles,
                        version: grunt.config('pkg.version'),
                        author: grunt.config('pkg.author'),
                        date: grunt.template.today("yyyy"),
                        timestamp: new Date().getTime(),
                        title: 'Automated Renewals'
                    }
                });
            }
        });
    });

    // In order to avoid having to specify manually the files needed for karma to
    // run, we use grunt to manage the list for us. The 'karma/*' files are
    // compiled as grunt templates for use by Karma. Yay!
    grunt.registerMultiTask('karmaconfig', 'Process karma config templates', function () {
        var jsFiles = filterForJS(this.filesSrc);
        var browser = grunt.option('headless') ? 'PhantomJS' : 'Chrome';

        grunt.file.copy('karma/karma-unit.tpl.js', grunt.config('build_dir') + '/karma-unit.js', {
            process: function (contents, path) {
                // This is the variable looped over in the karma template of our index.html exposed as "scripts"
                return grunt.template.process(contents, {
                    data: {
                        scripts: jsFiles,
                        browser: browser,
                        coverage: grunt.option('coverage'),
                        sourcemaps: grunt.option('sourcemaps'),
                        build_dir: grunt.config('build_dir'),
                        gen_dir: grunt.config('gen_dir')
                    }
                });
            }
        });
    });

    function createCycleLock() {
        fs.writeFile('../grunt_cycle_lock', '', function (err) {
            if (err) {
                grunt.log.writeln('Error creating cycle lock...');
                grunt.log.writeln(err);
            } else {
                grunt.log.writeln('Cycle lock created.');
            }
        });
    }

    // I'm using an event to create the lock because it occurs much (like a second or more) before the first task
    grunt.event.on('watch', createCycleLock);

    grunt.registerTask('lock', 'Creates a lock file', createCycleLock);

    grunt.registerTask('unlock', 'Removes the lock file', function () {
        fs.unlink('../grunt_cycle_lock', function (err) {
            if (err) {
                grunt.log.writeln('Error removing cycle lock...');
                grunt.log.writeln(err);
            } else {
                grunt.log.writeln('Cycle lock removed.');
            }
        });
    });


};
