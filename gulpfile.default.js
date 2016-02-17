///////////////////////////////////////////////////////
// load gulp plugins
///////////////////////////////////////////////////////
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    config = require('./anvil.json'),
    data = require('gulp-data'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    filesize = require('gulp-size'),
    sass = require('gulp-sass'),
    bless = require('gulp-bless'),
    nunjucks = require('gulp-nunjucks-html'),
    path = require('path'),
    del = require('del'),
    vinyl_paths = require('vinyl-paths'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

///////////////////////////////////////////////////////
// Build - process and minify sass
///////////////////////////////////////////////////////
gulp.task('sass:build', function() {
    gulp.src(config.build.scss.files)
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(autoprefixer({ browsers: ['last 2 version'] }))
        .pipe(notify({ message: 'SCSS is now compiled and prefixed' }))
        .pipe(reload({ stream: true }))
        .pipe(notify({ message: 'Your CSS file is now ready.'}))
        .pipe(filesize({ showFiles: true }))
        .pipe(gulp.dest(config.build.scss.dest))
        .on('error', gutil.log);
});
///////////////////////////////////////////////////////
// Styleguide - process and minify sass
///////////////////////////////////////////////////////
gulp.task('sass:styleguide', function() {
    gulp.src(config.styleguide.scss.files)
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(autoprefixer({ browsers: ['last 5 version'] }))
        .pipe(notify({ message: 'SCSS is now compiled and prefixed' }))
        .pipe(reload({ stream: true }))
        .pipe(notify({ message: 'Your CSS file is now ready.'}))
        .pipe(filesize({ showFiles: true }))
        .pipe(gulp.dest(config.styleguide.scss.dest))
        .on('error', gutil.log);
});

///////////////////////////////////////////////////////
// Styleguide - Swig Templating
///////////////////////////////////////////////////////
// We have to stop the data files from caching
function require_uncached( $module ) {
    delete require.cache[require.resolve( $module )];
    return require( $module );
}
gulp.task('templates:styleguide', function () {
    gulp.src(config.styleguide.templates.files)
        .pipe(data(function() {
            return require_uncached(config.styleguide.data_path + path.basename('data') + '.json');
        }))
        .pipe(nunjucks({
            searchPaths: [config.styleguide.templates.base]
        }))
        .pipe(gulp.dest(config.styleguide.templates.dest))
        .pipe(reload({ stream: true }))
        .pipe(notify({ message: 'Your Nunjucks templates are now ready'}));
});

gulp.task('templates:clean', function () {
    return del(config.styleguide.templates.dest + '_*');
});

///////////////////////////////////////////////////////
// Build - JS
///////////////////////////////////////////////////////
gulp.task('js:build', function () {
    gulp.src(config.build.js.files)
        .pipe(concat('app.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest(config.build.js.dest))
        .pipe(notify({ message: 'app.js concated and minified'}))
        .pipe(filesize({ showFiles: true }));
});
///////////////////////////////////////////////////////
// Styleguide - JS
///////////////////////////////////////////////////////
gulp.task('js:styleguide', function () {
    gulp.src(config.styleguide.js.files)
        .pipe(concat('app.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest(config.styleguide.js.dest))
        .pipe(notify({ message: 'app.js concated and minified'}))
        .pipe(filesize({ showFiles: true }));
});

///////////////////////////////////////////////////////
// Build - Images
///////////////////////////////////////////////////////
gulp.task('images:build', function () {
    gulp.src(config.build.images.files)
        .pipe(gulp.dest(config.build.images.dest));
});
///////////////////////////////////////////////////////
// Styleguide - Images
///////////////////////////////////////////////////////
gulp.task('images:styleguide', function () {
    gulp.src(config.styleguide.images.files)
        .pipe(gulp.dest(config.styleguide.images.dest));
});

///////////////////////////////////////////////////////
// Build - Fonts
///////////////////////////////////////////////////////
gulp.task('fonts:build', function () {
    gulp.src(config.build.fonts.files)
        .pipe(gulp.dest(config.build.fonts.dest));
});
///////////////////////////////////////////////////////
// Styleguide - Fonts
///////////////////////////////////////////////////////
gulp.task('fonts:styleguide', function () {
    gulp.src(config.styleguide.fonts.files)
        .pipe(gulp.dest(config.styleguide.fonts.dest));
});

///////////////////////////////////////////////////////
// Build - bless css for IE
///////////////////////////////////////////////////////
gulp.task('bless:build', function () {
    gulp.src('css/app.css')
        .pipe(bless())
        .pipe(gulp.dest('css'));
});

///////////////////////////////////////////////////////
// Build - serve with browserSync
///////////////////////////////////////////////////////
gulp.task('serve:build', function() {
    browserSync({
        proxy: 'http://site.dev'
        // server: {
        //     baseDir: "./build"
        // }
    });
});
///////////////////////////////////////////////////////
// Styleguide - serve with browserSync
///////////////////////////////////////////////////////
gulp.task('serve:styleguide', function() {
    browserSync({
        // proxy: 'http://site.dev'
        server: {
            baseDir: "./styleguide"
        }
    });
});


///////////////////////////////////////////////////////
// Tasks for building production files
///////////////////////////////////////////////////////
// the build once task
gulp.task('build', ['sass:build', 'js:build', 'images:build', 'fonts:build', 'bless:build'], function (cb) {
    cb();
});
// the build watch task
gulp.task('build:watch', ['build', 'serve:build'], function () {
    gulp.watch(config.build.scss.files, ['sass:build', 'serve:build']);
    gulp.watch(config.build.js.files, ['js:build', 'serve:build']);
    gulp.watch(config.build.images.files, ['images:build', 'serve:build']);
    gulp.watch(config.build.fonts.files, ['fonts:build', 'serve:build']);
    gulp.watch(config.build.scss.dest, ['bless:build']);
});

///////////////////////////////////////////////////////
// Tasks for building styleguide files
///////////////////////////////////////////////////////
// the styleguide build once
gulp.task('styleguide', ['sass:styleguide', 'templates:clean', 'templates:styleguide', 'js:styleguide', 'images:styleguide', 'fonts:styleguide'], function (cb) {
    cb();
});
// the styleguide watch task
gulp.task('styleguide:watch', ['styleguide', 'serve:styleguide'], function () {
    gulp.watch(config.styleguide.scss.files, ['sass:styleguide', 'serve:styleguide']);
    gulp.watch(config.styleguide.templates.files, ['templates:clean', 'templates:styleguide', 'serve:styleguide']);
    gulp.watch(config.styleguide.js.files, ['js:styleguide', 'serve:styleguide']);
    gulp.watch(config.styleguide.images.files, ['images:styleguide', 'serve:styleguide']);
    gulp.watch(config.styleguide.fonts.files, ['fonts:styleguide', 'serve:styleguide']);
});

///////////////////////////////////////////////////////
// Task to build both
///////////////////////////////////////////////////////
gulp.task('anvil', ['styleguide', 'build']);
