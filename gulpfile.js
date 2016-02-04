"use strict";

var path = require('path');

var gulp = require('gulp');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var chmod = require('gulp-chmod');
var htmlreplace = require('gulp-html-replace');

var through = require('through2');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var del = require('del');
var merge = require('merge-stream');
require('harmonize')();

var Output = './output';
var JavaScriptOutput = path.join(Output, 'js');
var StyleSheetsOutput = path.join(Output, 'css');

// holds path descriptors for our input files
var paths = {
    scripts: ["src/**/*.js"],
    tests: ["src/**/__tests__/*.js"],
    sass: ["src/scss/app.scss"],
    sassAllFiles: ["src/scss/**/*.scss"],
    html: ["src/index.html"],
    output: {
        css: {
            dev: 'app.css',
            prod: 'app.min.css'
        },
        js: {
            dev: 'app.js',
            prod: 'app.min.js'
        },
        vjs: {
            dev: 'vendor.js',
            prod: 'vendor.min.js'
        }
    }
};

var externalLibs = [
    'lodash',
    'react',
    'crossroads',
    'flux',
    'events'
];

// run browserify, with or without setting up incremental rebuilds with watchify
function createBuildApp(configuration) {
    var browserifyOpts = {
        transform: ["reactify", "envify"],
        entries: ["bin/app.js"]
    };
    // "watchify(browserified)" has the same API as "browserified", but watches for changes
    // and calls event handler registered with .on("update")
    var browserified = browserify(browserifyOpts);
    browserified = configuration === 'dev' ? watchify(browserified) : browserified;

    externalLibs.forEach(function(lib) {
        browserified.external(lib);
    });

    var build = function build(changedFiles) {
        var compileStream = browserified.bundle()
            .on('error', function (error) {
                gutil.log(error);
                if (configuration !== 'dev') process.exit(1);
            })
            .on('package', function (pkg) {
                gutil.log("## Package " + pkg.name + "(" + pkg.main + ") was included into application bundle");
            })
            .pipe(source(paths.output.js[configuration]))
            .pipe(buffer())
        if (configuration === 'prod') compileStream = compileStream.pipe(streamify(uglify()));
        compileStream = compileStream.pipe(gulp.dest(JavaScriptOutput));

        if (changedFiles && Array.isArray(changedFiles)) {
            var lintStream = gulp.src(changedFiles)
                    .pipe(eslint())
                    .pipe(eslint.format());

            return merge(lintStream, compileStream);
        }

        return compileStream;
    };

    if (configuration === 'dev') {
        browserified.on('update', build);
        browserified.on('log', gutil.log);
    }

    return build;
}

var whatch = function whatch() {
    return gulp
        .watch(paths.sassAllFiles, ['build-css-dev']);
}

var lint = function lint() {
    return gulp.src(paths.scripts)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
}

var buildClean = function buildClean(target, ext) {
    return function () {
        return gulp.src(path.join(target, "**/*." + ext))
            .pipe(chmod(777))
            .pipe(through.obj(function (file, enc, cb) {
                del(file.path, { force: true }).then(function (deletedFiles) {
                    gutil.log("Deleted", deletedFiles);
                    cb();
                }, gutil.log.bind(gutil));
            }));
    }
}

var createBuildVendors = function createBuildVendors(configuration) {
    return function build() {
        var browserified = browserify();

        externalLibs.forEach(function(lib) {
            browserified.require(lib);
        });

        var compileStream;
        compileStream = browserified.bundle()
                .on('error', gutil.log.bind(gutil, "Browserify Error"))
                .pipe(source(paths.output.vjs[configuration]))
                .pipe(buffer());
        if (configuration === 'prod') compileStream = compileStream.pipe(streamify(uglify()));

        return compileStream.pipe(gulp.dest(JavaScriptOutput));
    }
}

var createBuildHtml = function(configuration) {
    return function() {
        return gulp.src(paths.html)
            .pipe(htmlreplace({
                'css': 'css/' + paths.output.css[configuration],
                'js':  'js/' + paths.output.js[configuration],
                'vjs': 'js/' + paths.output.vjs[configuration]
            }))
            .pipe(gulp.dest(Output));
    }
}

var createBuildCss = function createBuildCss(configuration) {
    var outputStyle = configuration === 'prod' ? 'compressed' : 'nested';
    return function () {
        return gulp.src(paths.sass)
            .pipe(concat(paths.output.css[configuration]))
            .pipe(sass({outputStyle: outputStyle}).on('error', sass.logError))
            .pipe(gulp.dest(StyleSheetsOutput));
    }
}

gulp.task('clean-css', buildClean(StyleSheetsOutput, 'css'));
gulp.task('clean-js', buildClean(JavaScriptOutput, 'js'));
gulp.task('clean-html', buildClean(Output, 'html'));

gulp.task('lint', lint);

gulp.task('build-vendor-js-dev', createBuildVendors('dev'))
gulp.task('build-vendor-js-prod', createBuildVendors('prod'));

gulp.task('build-html-dev', ['clean-html'], createBuildHtml('dev'));
gulp.task('build-html-prod', ['clean-html'], createBuildHtml('prod'));

gulp.task('build-js-dev', ['clean-js', 'lint', 'build-vendor-js-dev'], createBuildApp('dev'));
gulp.task('build-js-prod', ['clean-js', 'lint', 'build-vendor-js-prod'], createBuildApp('prod'));

gulp.task('build-css-dev', ['clean-css'], createBuildCss('dev'));
gulp.task('build-css-prod', ['clean-css'], createBuildCss('prod'));

gulp.task('build-dev', ['build-css-dev', 'build-js-dev', 'build-html-dev'], whatch);
gulp.task('build-prod', ['build-css-prod', 'build-js-prod', 'build-html-prod']);

gulp.task('default', ['build-dev']);
