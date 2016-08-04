var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var buildSemantic = require('./semantic/tasks/build');
var watchSemantic = require('./semantic/tasks/watch');

var markdownFolder = process.env.MARKDOWN_FOLDER || 'markdown/';

var srcPath = './src/**/*.js';

gulp.task('build-ui', buildSemantic);
gulp.task('watch-ui', watchSemantic);

gulp.task('browser-sync', ['nodemon'], function () {
  browserSync.init(null, {
    proxy: 'http://localhost:3000',
    files: ['public/**/*.*', 'views/**/*.*', markdownFolder + '**/*.*'],
    browser: 'google chrome',
    port: 7000,
    startPath: '/example'
  });
});

gulp.task('nodemon', function (cb) {
  var started = false;
  return nodemon({
    script: 'src/listen.js'
  }).on('start', function () {
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task('build', ['build-ui'], function () {
  return gulp.src([
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/highlightjs/highlight.pack.min.js',
    './node_modules/underscore/underscore-min.js',
    './node_modules/raphael/raphael.min.js',
    './lib/sequence-diagram-min.js'
  ]).pipe(gulp.dest('./public/dist'));
});

gulp.task('serve', ['browser-sync', 'watch-ui']);
gulp.task('build-serve', ['build', 'browser-sync', 'watch-ui']);
gulp.task('default', ['serve']);