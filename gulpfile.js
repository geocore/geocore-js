var gulp = require('gulp');
var connect = require('gulp-connect');
var jsdoc = require('gulp-jsdoc');
var karma = require('karma').server;
var bump = require('gulp-bump');

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('webserver', function() {
  connect.server();
});

gulp.task('docs', function() {
  gulp.src("geocore.js")
    .pipe(jsdoc('./documentation_output'));
});

gulp.task('bump', function(){
  gulp.src(['./bower.json', './package.json'])
  .pipe(bump({type:'patch'}))
  .pipe(gulp.dest('./'));
});

gulp.task('bump-minor', function(){
  gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type:'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump-major', function(){
  gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type:'major'}))
    .pipe(gulp.dest('./'));
});

gulp.task('default', function() {
  // place code for your default task here
});
