gulp    = require('gulp'),
coffee  = require('gulp-coffee'),
concat  = require('gulp-concat'),
uglify  = require('gulp-uglify'),
watch   = require('gulp-watch'),
batch   = require('gulp-batch'),
util    = require('gulp-util');

source = [
  'src/burn.coffee',
  'src/adapters/**/*.coffee',
  'src/router.coffee',
  'src/controller.coffee',
  'src/model.coffee',
  'src/collection.coffee',
  'src/layout.coffee',
  'src/view.coffee',
  'src/bootstrap.coffee'
];

gulp.task('build', function() {
  burn = gulp.src(source)
    .pipe(concat({ path: 'burn.js' }))
    .pipe(coffee().on('error', util.log))
    .pipe(gulp.dest('./'))
});

gulp.task('default', function() {
  watch('src/**/*.coffee', batch(function (events, done) {
        gulp.start('build', done);
    }));

});