const gulp = require('gulp');
const install = require('gulp-install');
const exec = require('gulp-exec');
const fs = require('fs');
const copy = require('gulp-copy');
const connect = require('gulp-connect');
const watch = require('gulp-watch');

gulp.task('npm', function (done) {
    if (fs.existsSync(__dirname + '/src/node_modules')) {
        done();
    } else {
        gulp.src([__dirname + '/src/package.json'])
            .pipe(gulp.dest(__dirname + '/src/'))
            .pipe(install()).on('end', done);
    }
});

gulp.task('build', function () {
    const options = {
        continueOnError: false, // default = false, true means don't emit error event
        pipeStdout: false, // default = false, true means stdout is written to file.contents
        customTemplatingThing: 'build', // content passed to gutil.template()
        cwd: __dirname + '/src/'
    };
    const reportOptions = {
        err:    true, // default = true, false means don't write err
        stderr: true, // default = true, false means don't write stderr
        stdout: true  // default = true, false means don't write stdout
    };
    console.log(options.cwd);
    return gulp.src(__dirname + '/src/node_modules/react-scripts/scripts/build.js')
        .pipe(exec('node <%= file.path %>', options))
        .pipe(exec.reporter(reportOptions)).pipe(connect.reload());
});

gulp.task('copy', function () {
    return gulp.src(['src/build/*/**', 'src/build/*'])
        .pipe(gulp.dest('www/'));
});

gulp.task('webserver', function() {
    connect.server({
        root: 'src/build',
        livereload: true
    });
});

gulp.task('watch', ['webserver'], function () {
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event
    return watch(['src/src/*/**', 'src/src/*'], { ignoreInitial: true }, ['build']);
});

gulp.task('default', ['npm', 'build', 'copy']);