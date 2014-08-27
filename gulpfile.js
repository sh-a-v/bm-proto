'use strict';

var
  gulp = require('gulp'),
  stylus = require('gulp-stylus'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  minifyCSS = require('gulp-minify-css'),
  templateCache = require('gulp-angular-templatecache'),
  cssBase64 = require('gulp-css-base64'),
  rename = require('gulp-rename');

var
  paths = {
    /* Stylesheets */
    stylesheetsSrcFolder: 'src/stylesheets/',
    stylesheetsBuildFolder: 'build/stylesheets/',

    stylusSrcFiles: [
      'src/stylesheets/general/*.styl',
      'src/stylesheets/general/**/*.styl',

      'src/stylesheets/*.styl',
      'src/stylesheets/**/*.styl'
    ],

    /* Scripts */
    scriptsSrcFolder: 'src/scripts/',
    scriptsBuildFolder: 'build/scripts/',

    scriptsSrcLibFolder: 'src/scripts/lib/',

    scriptsSrcLibFiles: [
      'src/scripts/lib/angular/angular.min.js',
      'src/scripts/lib/angular/*.js',

      'src/scripts/lib/*.js',
      'src/scripts/lib/**/*.js'
    ],

    scriptsSrcAppFolder: 'src/scripts/app/',
    scriptsSrcAppFiles: [
      'src/scripts/app/init.js',

      'src/scripts/app/general/*.js',
      'src/scripts/app/general/**/*.js',

      'src/scripts/app/module.js',
      'src/scripts/app/**/module.js',
      'src/scripts/app/*.js',
      'src/scripts/app/**/*.js',

      '!src/scripts/lib/*'
    ],

    /* Templates */
    templatesSrcFolder: 'src/templates/',
    templatesBuildFolder: 'build/templates/',

    templatesSrcClientSideFiles: [
      'src/templates/client-side/*.html',
      'src/templates/client-side/**/*.html'

    ],
    templatesSrcServerSideFiles: [
      'src/templates/*.html'
    ]
  };


gulp
  /* Stylesheets */
  .task('stylus', function() {
    return gulp.src(paths.stylusSrcFiles)
      .pipe(concat('stylus.build.styl'))
      .pipe(stylus({pretty: true}))
      .pipe(cssBase64())
      .pipe(gulp.dest(paths.stylesheetsBuildFolder))
      .pipe(minifyCSS())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(paths.stylesheetsBuildFolder));
  })

  /* Templates */
  .task('templates', function() {
    gulp.src(paths.templatesSrcClientSideFiles)
      .pipe(templateCache({module: 'app', filename: 'client-side.build.js'}))
      .pipe(gulp.dest(paths.templatesBuildFolder));

    gulp.src(paths.templatesSrcServerSideFiles)
      .pipe(gulp.dest(paths.templatesBuildFolder));
  })

  /* Scripts lib */
  .task('scripts-lib', function() {
    return gulp.src(paths.scriptsSrcLibFiles)
      .pipe(concat('lib.build.min.js'))
      .pipe(gulp.dest(paths.scriptsBuildFolder));
  })

  /* Scripts app */
  .task('scripts-app', function() {
    gulp.src(paths.scriptsSrcAppFiles)
      .pipe(concat('app.build.js'))
      .pipe(gulp.dest(paths.scriptsBuildFolder))
      .pipe(uglify({mangle: false}))
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(paths.scriptsBuildFolder));
  });


gulp
  /* Build */
  .task('build', ['templates', 'stylus', 'scripts-lib', 'scripts-app'])

  /* Watch */
  .task('watch', function() {
    gulp.watch(paths.stylusSrcFiles, ['stylus']);
    gulp.watch([].concat(paths.templatesSrcServerSideFiles, paths.templatesSrcClientSideFiles), ['templates']);
    gulp.watch(paths.scriptsSrcAppFiles, ['scripts-app']);
  });
