/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
const gulp   = require('gulp');
const exec   = require('gulp-exec');
const fs     = require('fs');
const del    = require('del');
const crypto = require('crypto');

const dest = 'www/';

gulp.task('1-icons', done => {
    const dir = `${__dirname}/src/src/icons`;
    const files = fs.readdirSync(`${__dirname}/src/src/icons`).filter(e => e.match(/\.svg$/) && ignoreSvgs.indexOf(e) === -1);
    const texts = files.map(file => fs.readFileSync(`${dir}/${file}`));
    let text = ['import {Component} from "react";'];
    text.push('class IconList extends Component {');
    text.push('    static List = [');
    texts.forEach(file => text.push(`       "data:image/svg+xml;base64,${Buffer.from(file).toString('base64')}",`));
    text.push('    ];');
    text.push('}');
    text.push('export default IconList;');
    fs.writeFileSync(dir + '/icons.js', text.join('\n'));
    done();
});

gulp.task('0-clean', () => {
    return del([
        'src/node_modules/**/*',
        'src/build/**/*',
        'src/package-lock.json'
    ]).then(del([
        'src/node_modules',
        'src/build'
    ]));
});

function npmInstall() {
    return new Promise((resolve, reject) => {
        // Install node modules
        const cwd = __dirname.replace(/\\/g, '/') + '/src/';

        const cmd = `npm install -f`;
        console.log(`"${cmd} in ${cwd}`);

        // System call used for update of js-controller itself,
        // because during installation npm packet will be deleted too, but some files must be loaded even during the install process.
        const exec = require('child_process').exec;
        const child = exec(cmd, {cwd});

        child.stderr.pipe(process.stderr);
        child.stdout.pipe(process.stdout);

        child.on('exit', (code /* , signal */) => {
            // code 1 is strange error that cannot be explained. Everything is installed but error :(
            if (code && code !== 1) {
                reject('Cannot install: ' + code);
            } else {
                console.log(`"${cmd} in ${cwd} finished.`);
                // command succeeded
                resolve();
            }
        });
    });
}

gulp.task('2-npm', () => {
    if (fs.existsSync(__dirname + '/src/node_modules')) {
        return Promise.resolve();
    } else {
        return npmInstall();
    }
});

gulp.task('2-npm-dep', gulp.series('0-clean', () => {
    if (fs.existsSync(__dirname + '/src/node_modules')) {
        return Promise.resolve();
    } else {
        return npmInstall();
    }
}));

function build() {
    const options = {
        continueOnError:        false, // default = false, true means don't emit error event
        pipeStdout:             false, // default = false, true means stdout is written to file.contents
        customTemplatingThing:  'build', // content passed to gutil.template()
        cwd:                    __dirname + '/src/'
    };
    const reportOptions = {
        err:    true, // default = true, false means don't write err
        stderr: true, // default = true, false means don't write stderr
        stdout: true  // default = true, false means don't write stdout
    };

    // update version
    const version = require('./package.json').version;
    const json = require('./src/package.json');
    json.version = version;
    fs.writeFileSync(__dirname + '/src/package.json', JSON.stringify(json, null, 2));

    console.log(options.cwd);

    if (fs.existsSync(__dirname + '/src/node_modules/react-scripts/scripts/build.js')) {
        return gulp.src(__dirname + '/src/node_modules/react-scripts/scripts/build.js')
            .pipe(exec(file => `node ${file.path}`, options))
            .pipe(exec.reporter(reportOptions));
    } else {
        return gulp.src(__dirname + '/node_modules/react-scripts/scripts/build.js')
            .pipe(exec(file => `node ${file.path}`, options))
            .pipe(exec.reporter(reportOptions));
    }
}

gulp.task('3-build', () => build());

gulp.task('3-build-dep', gulp.series('2-npm', '1-icons', () => build()));

const ignoreSvgs = ['fireOff.svg'];

function getHash(data) {
    const md5 = crypto.createHash('md5');
    md5.update(data);

    return md5.digest('hex');
}

function copyFiles() {
    return del([
        'www/**/*'
    ]).then(() => {
        gulp.src([
            'src/build/*/**',
            'src/build/*',
            '!src/build/vendor/conn.js',
            '!src/build/vendor/detector.js',
            '!src/build/_socket',
            '!src/build/_socket/info.js'
        ])
            .pipe(gulp.dest('www/'));
    });
}

gulp.task('4-copy', gulp.series('3-build', () => {
    return copyFiles();
}));

gulp.task('4-copy-dep', gulp.series('3-build-dep', () => {
    return copyFiles();
}));

function patchIndex() {
    return new Promise(resolve => {
        if (fs.existsSync(dest + '/index.html')) {
            let code = fs.readFileSync(dest + '/index.html').toString('utf8');
            // replace code
            code = code.replace(/<script>const script=document[^<]+<\/script>/, `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="./lib/js/socket.io.js"></script>`);
            code = code.replace(/<script>var script=document[^<]+<\/script>/, `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="./lib/js/socket.io.js"></script>`);
            fs.writeFileSync(dest + '/index.html', code);
            resolve();
        } else {
            // wait till finished
            setTimeout(() => {
                if (fs.existsSync(dest + '/index.html')) {
                    let code = fs.readFileSync(dest + '/index.html').toString('utf8');
                    // replace code
                    code = code.replace(/<script>const script=document[^<]+<\/script>/, `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="./lib/js/socket.io.js"></script>`);
                    code = code.replace(/<script>var script=document[^<]+<\/script>/, `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="./lib/js/socket.io.js"></script>`);
                    fs.writeFileSync(dest + '/index.html', code);
                }
                resolve();
            }, 2000);
        }
    });
}

gulp.task('5-patch', () => patchIndex());

gulp.task('5-patch-dep', gulp.series('4-copy-dep', '5-patch'));

gulp.task('default', gulp.series('5-patch-dep'));
