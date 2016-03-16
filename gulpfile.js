var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var buildSemantic = require('./semantic/tasks/build');
var watchSemantic = require('./semantic/tasks/watch');
var mocha = require('gulp-mocha');

var markdownFolder = process.env.MARKDOWN_FOLDER || 'markdown/';

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

gulp.task('mocha', function() {
  return gulp.src(['test/*.spec.js'], {})
    .pipe(mocha());
});

gulp.task('watch-mocha', function() {
  gulp.run('mocha');
  return gulp.watch(['./src/**/*.js', 'test/**/*.js'], ['mocha']);
});

gulp.task('serve-dev', ['browser-sync', 'watch-ui']);
gulp.task('serve-build', ['build', 'browser-sync', 'watch-ui']);
gulp.task('default', ['serve-dev']);