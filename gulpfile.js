const gulp = require('gulp');
//For Sass
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const livereload = require('gulp-livereload');

//For Css
const rename = require('gulp-rename');
const gulpminifycss = require('gulp-minify-css');
const plumber = require('gulp-plumber');
const remember = require('gulp-remember');

//For Js
const rigger = require('gulp-rigger');
const uglify = require('gulp-uglify');
const notify = require('gulp-notify');
const newer = require('gulp-newer'); /*  Plugin look for new changes in files */

/* Plugin for Images */
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

const clean = require('gulp-clean'); /* Plugin delete some folder, content */
const browserSync = require("browser-sync");
const reload = browserSync.reload;

/*Task for webserver*/
const config = {
  server: {
      baseDir: "./build"
  },
  tunnel: false,
  host: 'localhost',
  port: 9000,
  logPrefix: "SergeyKoval"
};

gulp.task('webserver', function () {
  browserSync(config);
});

gulp.task('html', function() {
  return gulp.src('./src/index.html')
  .pipe(rigger())
  .pipe(gulp.dest('./build'))
  .pipe(reload({stream: true}));
});

gulp.task('css', function() {
  return gulp.src('./build/css/main.css')
  .pipe(gulpminifycss())
  .pipe(rename('main.min.css'))
  .pipe(gulp.dest('./build/css'))
});

gulp.task('sass', function() {
  return gulp.src('./src/sass/**/*.scss')
  .pipe(plumber())
  .pipe(autoprefixer({
    browsers: ['last 2 version'],
    casced : false,
  }))
  .pipe(remember('sass'))
  .pipe(sass())
  .pipe(gulp.dest('./build/css/'))
  .pipe(reload({stream: true}));
});

gulp.task('js', function() {
  gulp.src('./src/js/main.js')
  .pipe(rigger())
  .pipe(plumber({errorHandler:
    notify.onError(function (err) {
      return {
          title: 'js',
          message: err.message
      };
    })
  }))
  .pipe(uglify('main.min.js', {
    outSourceMap: true
  }))
  .pipe(gulp.dest('./build/js'))
  .pipe(reload({stream: true}))
});

/* Task for folder Vendor */
gulp.task('vendor', function() {
  gulp.src('./src/vendor/**/*.*')
    .pipe(gulp.dest('./build/vendor/'))
});

/* Task for folder Images */
gulp.task('image', function () {
  gulp.src('./src/img/**/*.*')
      .pipe(newer('./build/img/'))
      .pipe(imagemin({
          progressive: true,
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant()],
          interlaced: true
      }))
      .pipe(gulp.dest('./build/img/'))
      .pipe(reload({stream: true}));
});

/* Task for folder Fonts */
gulp.task('fonts', function() {
  gulp.src('./src/fonts/**/*.*')
    .pipe(newer('./build/fonts/'))
    .pipe(gulp.dest('./build/fonts/'))
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.html', ['html']);
  gulp.watch('./src/sass/**/*.scss', ['sass']);
  gulp.watch('./build/css/main.css', ['css']);
  gulp.watch('./src/img/**/*.*', ['image']);
  gulp.watch('./src/js/**/*.js', ['js']);
  gulp.watch('./src/vendor/**/*.*', ['vendor']);
});

gulp.task('build', ['html', 'sass', 'css', 'js', 'fonts', 'image', 'vendor']);
gulp.task('default', ['build', 'webserver', 'watch']);

/* Task Clean (delete folder [build/]) */
gulp.task('clean', function () {
  return gulp.src('build', {read: false})
      .pipe(clean());
});