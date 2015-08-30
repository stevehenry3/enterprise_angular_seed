module.exports = function() {
    var client = './src/client/';
    var clientApp = client + 'app/';
    var clientAssets = client + 'assets/';
    var output = './build/';
    var report = './report/';
    var root = './';
    var server = './src/node-server/';
    var specRunnerFile = 'specs.html';
    var temp = './.tmp/';
    var wiredep = require('wiredep');
    var bowerFiles = wiredep({devDependencies: true})['js'];

    var config = {
        /**
         * Files paths
         */
        alljs: [
            './src/client/**/*.js'
        ],
        bowerFonts: [ client + 'bower_components/**/*.eot',
            client + 'bower_components/**/*.svg',
            client + 'bower_components/**/*.ttf',
            client + 'bower_components/**/*.woff',
            client + 'bower_components/**/*.otf' ],
        bowerSrc: client + 'bower_components/',
        build: output,
        client: client,
        clientApp: clientApp,
        clientAll: clientApp + '**/*',
        clientAssetsPath: clientAssets,
        clientFonts: clientAssets + 'fonts/**/*.*',
        clientJs: clientApp + '**/*.js',
        clientStylesPath: clientAssets + 'scss/',
        clientTemplates: clientApp + '**/*.html',
        clientVendor: client + 'vendor/**/*.*',
        css: temp + '**/*.css',
        fonts: client + 'bower_components/font-awesome/fonts/**/*.*',
        html: clientApp + '**/*.html',
        images: [ clientAssets + 'img/*.png',
            clientAssets + 'img/*.gif',
            clientAssets + 'img/*.jpg',
            clientAssets + 'img/*.jpeg' ],
        index: client + 'index.html',
        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],
        output: output,
        outputBower: output + 'bower_components/',
        outputFonts: output + 'fonts/',
        outputImages: output + 'assets/img/',
        outputIndex: output + 'index.html',
        outputJs: output + 'js/',
        outputStyles: output + 'styles/',
        outputTemplates: output + 'templates/',
        outputVendor: output + 'vendor/',
        scss: clientAssets + 'scss/**/*.scss',
        report: report,
        root: root,
        server: server,
        temp: temp,

        /**
         * optimized files
         */
        optimized: {
            app: 'app.js',
            lib: 'lib.js'
        },

        /**
         * template cache
         */
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                standAlone: false,
                root: 'app/'
            }
        },

        /**
         * browser sync
         */
        browserReloadDelay: 1000,

        /**
         * Bower and NPM locations
         */
        bower: {
            json: require('./bower.json'),
            directory: client + 'bower_components/',
            ignorePath: '../..'
        },
        packages : [
            './package.json',
            './bower.json'
        ],

        /**
         * specs.html, our HTML spec runner
         */
        specRunner: client + specRunnerFile,
        specRunnerFile: specRunnerFile,
        testlibraries: [
            'node_modules/mocha/mocha.js',
            'node_modules/chai/chai.js',
            'node_modules/mocha-clean/index.js',
            'node_modules/sinon-chai/lib/sinon-chai.js'
        ],
        specs: [clientApp + '**/*.spec.js'],

        /**
         * Karma and testing settings
         */
        specHelpers: [client + 'test-helpers/*.js'],
        serverIntegrationSpecs: [client + 'tests/**/*.spec.js'],

        /**
         * Node settings
         */
        defaultPort: 3000,
        nodeServer: server + 'index.js'

    };

    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };

    config.karma = getKarmaOptions();

    return config;

    ////////////////

    function getKarmaOptions() {
        var options = {
            files: [].concat(
                bowerFiles,
                config.specHelpers,
                client + '**/*.module.js',
                client + '**/*.js',
                temp + config.templateCache.file,
                config.serverIntegrationSpecs
            ),
            exclude: [],
            coverage: {
                dir: report + 'coverage',
                reporters: [
                    {type: 'html', subdir: 'report-html'},
                    {type: 'lcov', subdir: 'report-lcov'},
                    {type: 'text-summary'}
                ]
            },
            preprocessors: {}
        };
        options.preprocessors[clientApp + '**/!(*.spec)+(.js)'] = ['coverage'];
        return options;
    }
};