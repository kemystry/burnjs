gulp    = require('gulp'),
coffee  = require('gulp-coffee'),
concat  = require('gulp-concat'),
uglify  = require('gulp-uglify'),
watch   = require('gulp-watch'),
batch   = require('gulp-batch'),
codo    = require('gulp-codo'),
util    = require('gulp-util');

source = [
  'src/burn.coffee',
  'src/cache.coffee',
  'src/adapters/**/*.coffee',
  'src/router.coffee',
  'src/filter_chain.coffee',
  'src/controller.coffee',
  'src/model.coffee',
  'src/collection.coffee',
  'src/template.coffee',
  'src/attachment.coffee',
  'src/layout.coffee',
  'src/view.coffee',
  'src/binders/**/*.coffee',
  'src/filters/**/*.coffee',
  'src/components/**/*.coffee',
  'src/bootstrap.coffee'
];

gulp.task('doc', function () {
  gulp.src('./src/**/*.coffee', {read: false})
  .pipe(codo({
    name: 'Burnjs',
    title: 'Burnjs Documentation',
    readme: 'README.md'
  }));
});

gulp.task('build', function() {
  burn = gulp.src(source)
    .pipe(concat({ path: 'burn.js' }))
    .pipe(coffee().on('error', util.log))
    .pipe(gulp.dest('./'));
});

gulp.task('build-min', function () {
  burnMin = gulp.src(source)
    .pipe(concat({ path: 'burn.min.js' }))
    .pipe(coffee().on('error', util.log))
    .pipe(uglify({ mangle: false, preserveComments: 'license' }))
    .pipe(gulp.dest('./'));
});

gulp.task('dist', function () {
  gulp.start('build');
  gulp.start('build-min');
  gulp.start('doc');
});

gulp.task('start-dev', function() {
  watch('src/**/*.coffee', batch(function (events, done) {
        gulp.start('build', done);
    }));

});