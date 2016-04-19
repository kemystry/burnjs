gulp    = require('gulp'),
coffee  = require('gulp-coffee'),
concat  = require('gulp-concat'),
uglify  = require('gulp-uglify'),
watch   = require('gulp-watch'),
batch   = require('gulp-batch'),
codo    = require('gulp-codo'),
util    = require('gulp-util');

bundledSource = [
  'node_modules/jquery/dist/jquery.js',
  'node_modules/underscore/underscore.js',
  'node_modules/string/dist/string.js',
  'node_modules/backbone/backbone.js',
  'node_modules/backbone-relational/backbone-relational.js',
  'node_modules/backbone-validation/dist/backbone-validation.js',
  'node_modules/rivets/dist/rivets.bundled.min.js',
  'node_modules/moment/moment.js',
  'node_modules/numeral/numeral.js',
  'tmp_burn.js'
]

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
  'src/formatters/**/*.coffee',
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
  return gulp.src(source)
    .pipe(concat({ path: 'burn.js' }))
    .pipe(coffee().on('error', util.log))
    .pipe(gulp.dest('./'));
});

gulp.task('build-bundled', function() {
  var burn = gulp.src(source)
    .pipe(concat({ path: 'tmp_burn.js' }))
    .pipe(coffee().on('error', util.log))
    .pipe(gulp.dest('./'));
  burn.on('end', function () {
    gulp.src(bundledSource)
      .pipe(concat({ path: 'burn.bundled.js' }))
      .pipe(gulp.dest('./'));
  });
});

gulp.task('build-min', function () {
  return gulp.src(source)
    .pipe(concat({ path: 'burn.min.js' }))
    .pipe(coffee().on('error', util.log))
    .pipe(uglify({ mangle: false, preserveComments: 'license' }))
    .pipe(gulp.dest('./'));
});

gulp.task('dist', function () {
  gulp.start('build-bundled');
  gulp.start('build');
  gulp.start('build-min');
  gulp.start('doc');
});

gulp.task('default', function() {
  gulp.start('build');
  watch('src/**/*.coffee', batch(function (events, done) {
        gulp.start('build', done);
    }));

});
