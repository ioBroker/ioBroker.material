/**
 * Copyright 2018 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
'use strict';

const gulp       = require('gulp');

gulp.task('build', done => {
    const { fork } = require('child_process');

    const child = fork(__dirname + '/node_modules/react-scripts/scripts/build.js', {
        cwd: __dirname
    });
    child.on('exit', (code, signal) => done());
});

