var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var buildSemantic = require('./semantic/tasks/build');
var watchSemantic = require('./semantic/tasks/watch');

var markdownFolder = process.env.MARKDOWN_FOLDER || 'markdown/';

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
  return gulp.src('./node_modules/jquery/dist/').pipe(gulp.dest('./public/dist/'));
});

gulp.task('serve-dev', ['browser-sync', 'watch-ui']);
gulp.task('serve-build', ['build', 'browser-sync', 'watch-ui']);
gulp.task('default', ['serve-dev']);