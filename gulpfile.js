var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var buildSemantic = require('./semantic/tasks/build');
var watchSemantic = require('./semantic/tasks/watch');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

var markdownFolder = process.env.MARKDOWN_FOLDER || 'markdown/';

var testsPath = 'test/**/*.js';
var srcPath = './src/**/*.js';

gulp.task('build-ui', buildSemantic);
gulp.task('watch-ui', watchSemantic);

gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init(null, {
    proxy: 'http://localhost:3000',
    files: ['public/**/*.*', 'views/**/*.*', markdownFolder + '**/*.*'],
    browser: 'google chrome',
    port: 7000,
    startPath: '/example'
  });
});

gulp.task('nodemon', function(cb) {
  var started = false;
  return nodemon({
    script: 'src/listen.js'
  }).on('start', function() {
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task('build', ['build-ui'], function() {
  return gulp.src([
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/highlightjs/highlight.pack.min.js'
  ]).pipe(gulp.dest('./public/dist'));
});

gulp.task('cover', function() {
  return gulp.src([srcPath])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['cover'], function() {
  return gulp.src([testsPath], {})
    .pipe(mocha())
    .pipe(istanbul.writeReports())
     // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task('test-watch', function() {
  gulp.run('test');
  return gulp.watch([srcPath, testsPath], ['test']);
});

gulp.task('serve-dev', ['browser-sync', 'watch-ui']);
gulp.task('serve-build', ['build', 'browser-sync', 'watch-ui']);
gulp.task('default', ['serve-dev']);