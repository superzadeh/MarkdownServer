var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var buildSemantic = require('./semantic/tasks/build');
var watchSemantic = require('./semantic/tasks/watch');

gulp.task('build-ui', buildSemantic);
gulp.task('watch-ui', watchSemantic);

gulp.task('default', ['browser-sync', 'watch-ui'], function () {
});

gulp.task('browser-sync', ['nodemon'], function() {
	browserSync.init(null, {
		proxy: "http://localhost:3000",
        files: ["public/**/*.*"],
        browser: "google chrome",
        port: 7000,
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
