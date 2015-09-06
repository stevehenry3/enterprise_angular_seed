var gulp = require('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var config = require('./gulp.config')();
var del = require('del');
var path = require('path');
var _ = require('lodash');
var runSequence = require('gulp-run-sequence');
var $ = require('gulp-load-plugins')({lazy: true});
var notifier = require('node-notifier');
var port = process.env.PORT || config.defaultPort;

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('vet', function() {
    // log('Analyzing source with JSHint and JSCS');
    log('Analyzing source with JSHint');

    return gulp
        .src(config.clientJs)
        .pipe($.if(args.verbose, $.print()))
        // .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('styles', ['clean-styles'], function() {
    log('Compiling SCSS --> CSS');

    return gulp
        .src(config.scss)
        .pipe($.plumber())
        .pipe($.sass())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.temp));
});

gulp.task('fonts', ['clean-fonts'], function() {
    log('Copying fonts');

    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.build + 'fonts'));
});

gulp.task('images', ['clean-images'], function() {
    log('Copying and compressing the images');

    return gulp
        .src(config.images)
        .pipe($.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(config.build + 'images'));
});

gulp.task('clean', function(done) {
    var delconfig = [].concat(config.build, config.temp);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig, done);
});

gulp.task('clean-fonts', function(done) {
    clean(config.build + 'fonts/**/*.*', done);
});

gulp.task('clean-images', function(done) {
    clean(config.build + 'images/**/*.*', done);
});

gulp.task('clean-styles', function(done) {
    clean(config.temp + '**/*.css', done);
});

gulp.task('clean-code', function(done) {
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + '**/*.html',
        config.build + 'js/**/*.js'
    );
    clean(files, done);
});

gulp.task('sass-watcher', function() {
    gulp.watch([config.sass], ['styles']);
});

gulp.task('templatecache', ['clean-code'], function() {
    log('Creating AngularJS $templateCache');

    return gulp
        .src(config.clientTemplates)
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
});

gulp.task('wiredep', function() {
    log('Wire up the bower css js and our app js into the html');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)  // Use markers inside 'index.html' to inject into
        .pipe(wiredep(options))     // Gather and arrange (in order) the bower dependencies
        .pipe($.inject(gulp.src(config.js)))    // Inject javascript file types
        .pipe(gulp.dest(config.client));    // Output to revised 'index.html' (location of 'index.html' provided as param
});

// ------------------------ START: DEV BUILD ----------------------- //

gulp.task('dev-build', function(callback) {
    log('<dev-build> Building and copying all files (without optimizing) to output folder: ' + config.build);
    // 1. Copy all app JS, compile CSS, fonts, images to build/xxx folder.
    // 2a. Use src/client/app/index.html as starting point for injecting into & comment-markers to use.
    // 2b. Grab all JS/CSS files from build/xxx folder, and inject into build/index.html.
    // 2c. Grab all bower dependencies, and create & inject into build/index.html.
    // 3. Go thru build/index.html comment-markers, find bower dependencies specified, and copy to build/bower_components.
    runSequence('dev-copy', 'dev-wiredep', 'dev-bower', callback);
});

gulp.task('dev-copy', ['dev-copy-vendor', 'dev-styles', 'dev-images', 'dev-fonts', 'dev-copy-html'], function() {
    log('Copying all application js|css|images|fonts to output folder: ' + config.outputJs);

    return gulp
        .src(config.clientJs)
        .pipe($.print())
        .pipe(gulp.dest(config.outputJs));
});

gulp.task('dev-copy-vendor', function() {
    log('Copying vendor files to output folder: ' + config.outputVendor);

    return gulp
        .src(config.clientVendor)
        .pipe($.print())
        .pipe(gulp.dest(config.outputVendor));
});

gulp.task('dev-copy-html', function() {
    log('Copying all application .tpl.html templates to output folder: ' + config.outputTemplates);

    return gulp
        .src(config.clientTemplates)
        .pipe($.print())
        .pipe(gulp.dest(config.outputTemplates));
});

gulp.task('dev-bower', function() {
    log('<dev-bower> Copying all Bower js|css files in ' + config.outputIndex + ' to output folder: ' + config.build);
    var bowerAssets = $.useref.assets({searchPath: config.client, noconcat: true});
    var jsLibFilter = $.filter('**/' + config.optimized.lib);

    return gulp
        .src(config.outputIndex)
        .pipe(bowerAssets)
        .pipe($.print())
        //.pipe(jsLibFilter)    //TODO: (SH) not sure why this isn't needed!
        .pipe($.useref())
        .pipe($.copy(config.build, { prefix: 2 }));     // prefix; ignore first '2' levels of folders when copying

});

gulp.task('dev-wiredep', function() {
    log('<dev-wiredep> Wire up the bower css js and our app js (from /build) into the html');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    gulp
        .src(config.outputJs + '**/*.js', {read:false})
        .pipe($.print());

    gulp
        .src(config.outputStyles + '**/*.css', {read:false})
        .pipe($.print());

    return gulp
        .src(config.index)          // Use src 'index.html as starting point, and use comment markers to inject into
        .pipe(wiredep(options))     // Inject (in order) the bower js+css dependencies
        .pipe($.inject( gulp.src(config.outputJs + '**/*.js'),  // Inject application javascript from build/ folder
            { ignorePath: 'build/', addRootSlash: false }))
        .pipe($.inject(gulp.src(config.outputStyles + '**/*.css'),  // Inject application css from build/ folder
            { ignorePath: 'build/', addRootSlash: false }))
        .pipe(gulp.dest(config.build));    // Output to revised 'index.html' file to dev client folder
});

gulp.task('dev-styles', ['dev-clean-styles'], function() {
    log('<dev-styles> Compiling SCSS --> CSS and outputting to folder: ' + config.outputStyles);

    return gulp
        .src(config.scss)
        .pipe($.print())
        .pipe($.plumber())
        .pipe($.sass())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe($.print())
        .pipe(gulp.dest(config.outputStyles));
});

gulp.task('dev-watch', ['dev-build'], function() {
    log('<dev-watch> Watching SASS, HTML, and JS files for auto-re-build...');
    log('SASS will output to: ' + config.outputStyles);

    //TODO: (SH) this does not handle new or deleted files yet! Need to add injection step for that!
    gulp.src(config.clientApp + '/*.klasdflsdf')
        .pipe($.watch(config.clientTemplates, {base: config.clientApp}))
        .pipe($.plumber())
        .pipe($.print())
        .pipe(gulp.dest(config.outputTemplates));

    gulp.src(config.clientApp + '/*.klasdflsdf')
        .pipe($.watch(config.clientJs, {base: config.clientApp}))
        .pipe($.plumber())
        .pipe($.print())
        .pipe(gulp.dest(config.outputJs));

    gulp.src(config.clientApp + '/*.klasdflsdf')
        .pipe($.watch(config.index, {base: config.clientApp}))
        .pipe($.plumber())
        .pipe($.print())
        .pipe($.tap(function(file, t) {
            return runSequence('dev-wiredep');
        }));

    return gulp
        .src(config.clientApp + '/*.klasdflsdf')
        .pipe($.plumber())
        .pipe($.watch(config.scss, {base: config.clientStylesPath}))
        .pipe($.tap(function(file, t) {
            return runSequence('dev-styles');
        }));
    //.pipe($.print())
    //.pipe($.sass())
    //.pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
    //.pipe(gulp.dest(config.outputStyles));
});

gulp.task('dev-images', function() {
    log('<dev-images> Copying and compressing the images and outputting to folder: ' + config.outputImages);

    return gulp
        .src(config.images)
        .pipe($.print())
        //.pipe($.imagemin({optimizationLevel: 4})) //TODO: (SH) removed for windows issue
        .pipe(gulp.dest(config.outputImages));
});

gulp.task('dev-fonts', ['dev-bootstrap-fonts'], function() {
    log('<dev-fonts> Copying bootstrap & font-awesome fonts');

    return gulp
        .src(config.clientFonts)
        .pipe($.print())
        .pipe(gulp.dest(config.outputFonts));
});

gulp.task('dev-bootstrap-fonts', function() {
    return gulp
        .src(config.bowerFonts)
        .pipe($.print())
        .pipe(gulp.dest(config.outputBower));
});

gulp.task('dev-clean', function(done) {
    clean(config.build + '**/*', done);
});

gulp.task('dev-clean-styles', function(done) {
    clean(config.outputStyles + '**/*.css', done);
});

gulp.task('dev-clean-fonts', function(done) {
    clean(config.outputFonts + '**/*.*', done);
});

gulp.task('dev-clean-images', function(done) {
    clean(config.outputImages + '**/*.*', done);
});

// ------------------------ END: DEV BUILD ----------------------- //

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function() {
    log('Wire up the application css into the html');

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

gulp.task('build', ['inject', 'images', 'fonts'], function() {
    log('Building everything');

    var msg = {
        title: 'gulp build',
        subtitle: 'Deployed to the build folder',
        message: 'Running `gulp serve-build`'
    };
    del(config.temp);
    log(msg);
    notify(msg);
});


gulp.task('build-prod', ['optimize', 'images', 'fonts'], function() {
    log('Building everything for production release');

    var msg = {
        title: 'gulp build',
        subtitle: 'Deployed to the build folder',
        message: 'Running `gulp serve-build`'
    };
    del(config.temp);
    log(msg);
    notify(msg);
});

gulp.task('serve-specs', ['build-specs'], function(done) {
    log('run the spec runner');
    serve(true /* isDev */, true /* specRunner */);
    done();
});

gulp.task('build-specs', ['templatecache'], function() {
    log('building the spec runner');

    var wiredep = require('wiredep').stream;
    var options = config.getWiredepDefaultOptions();
    var specs = config.specs;

    options.devDependencies = true;

    if (args.startServers) {
        specs = [].concat(specs, config.serverIntegrationSpecs);
    }

    return gulp
        .src(config.specRunner)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.testlibraries),
            {name: 'inject:testlibraries', read: false}))
        .pipe($.inject(gulp.src(config.js)))
        .pipe($.inject(gulp.src(config.specHelpers),
            {name: 'inject:spechelpers', read: false}))
        .pipe($.inject(gulp.src(specs),
            {name: 'inject:specs', read: false}))
        .pipe($.inject(gulp.src(config.temp + config.templateCache.file),
            {name: 'inject:templates', read: false}))
        .pipe(gulp.dest(config.client));
});

/** TODO: (SH) Removed 'test' for now **/
// gulp.task('optimize', ['inject', 'test'], function() {
gulp.task('optimize', ['inject'], function() {
    log('Optimizing the javascript, css, html');

    var assets = $.useref.assets({searchPath: config.client});
    var templateCache = config.temp + config.templateCache.file;
    var cssFilter = $.filter('**/*.css');
    var jsLibFilter = $.filter('**/' + config.optimized.lib);
    var jsAppFilter = $.filter('**/' + config.optimized.app);

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe($.inject(
            gulp.src(templateCache, {read: false}), {
                starttag: '<!-- inject:templates:js -->'
            }))
        .pipe(assets)
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(jsLibFilter)
        .pipe($.uglify())
        .pipe(jsLibFilter.restore())
        .pipe(jsAppFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(jsAppFilter.restore())
        .pipe($.rev())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(gulp.dest(config.build))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(config.build));
});

/**
 * Bump the version
 * --type=pre will bump the prerelease version *.*.*-x
 * --type=patch or no flag will bump the patch version *.*.x
 * --type=minor will bump the minor version *.x.*
 * --type=major will bump the major version x.*.*
 * --version=1.2.3 will bump to a specific version and ignore other flags
 */
gulp.task('bump', function() {
    var msg = 'Bumping versions';
    var type = args.type;
    var version = args.version;
    var options = {};
    if (version) {
        options.version = version;
        msg += ' to ' + version;
    } else {
        options.type = type;
        msg += ' for a ' + type;
    }
    log(msg);

    return gulp
        .src(config.packages)
        .pipe($.print())
        .pipe($.bump(options))
        .pipe(gulp.dest(config.root));
});

gulp.task('serve-build', ['build'], function() {
    serve(false /* isDev */);
});

gulp.task('serve-dev', ['inject'], function() {
    serve(true /* isDev */);
});

gulp.task('test', ['vet', 'templatecache'], function(done) {
    startTests(true /* singleRun */, done);
});

gulp.task('autotest', ['vet', 'templatecache'], function(done) {
    startTests(false /* singleRun */, done);
});

//////////// functions /////////////

function serve(isDev, specRunner) {
    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server]
    };

    return $.nodemon(nodeOptions)
        .on('restart', function(ev) {
            log('*** nodemon restarted');
            log('files changed on restart:\n' + ev);
            setTimeout(function() {
                browserSync.notify('reloading now ...');
                browserSync.reload({stream: false});
            }, config.browserReloadDelay);
        })
        .on('start', function() {
            log('*** nodemon started');
            startBrowserSync(isDev, specRunner);
        })
        .on('crash', function() {
            log('*** nodemon crashed: script crashed for some reason');
        })
        .on('exit', function() {
            log('*** nodemon exited cleanly');
        });
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function notify(options) {
    var notifyOptions = {
        sound: 'Bottle',
        contentImage: path.join(__dirname, 'gulp.png'),
        icon: path.join(__dirname, 'gulp.png')
    };
    _.assign(notifyOptions, options);
    notifier.notify(notifyOptions);
}

function startBrowserSync(isDev, specRunner) {
    if (args.nosync || browserSync.active) {
        return;
    }

    log('Starting browser-sync on port ' + port);

    if (isDev) {
        gulp.watch([config.scss], ['styles'])
            .on('change', function(event) { changeEvent(event); });
    } else {
        gulp.watch([config.scss, config.js, config.clientTemplates], ['optimize', browserSync.reload])
            .on('change', function(event) { changeEvent(event); });
    }

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.client + '**/*.*',
            '!' + config.scss,
            config.temp + '**/*.css'
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 0 //1000
    };

    if (specRunner) {
        options.startPath = config.specRunnerFile;
    }

    browserSync(options);
}

function startTests(singleRun, done) {
    var child;
    var fork = require('child_process').fork;
    var karma = require('karma').server;
    var excludeFiles = [];
    var serverSpecs = config.serverIntegrationSpecs;

    if (args.startServers) { // gulp test --startServers
        log('Starting server');
        var savedEnv = process.env;
        savedEnv.NODE_ENV = 'dev';
        savedEnv.PORT = 9999;
        child = fork(config.nodeServer);
    } else {
        if (serverSpecs && serverSpecs.length) {
            excludeFiles = serverSpecs;
        }
    }

    karma.start({
        configFile: __dirname + '/karma.conf.js',
        exclude: excludeFiles,
        singleRun: !!singleRun
    }, karmaCompleted);

    function karmaCompleted(karmaResult) {
        log('Karma completed!');
        if (child) {
            log('Shutting down the child process');
            child.kill();
        }
        if (karmaResult === 1) {
            done('karma: tests failed with code ' + karmaResult);
        } else {
            done();
        }
    }
}

function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done);
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}