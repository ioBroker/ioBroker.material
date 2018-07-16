const gulp       = require('gulp');
const exec       = require('gulp-exec');
const fs         = require('fs');
const copy       = require('gulp-copy');
const connect    = require('gulp-connect');
const watch      = require('gulp-watch');
const del        = require('del');
const uglify     = require('gulp-uglify');
const concat     = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const crypto     = require('crypto');

const dir = __dirname + '/src/src/i18n/';
gulp.task('i18n=>flat', done => {
    const files = fs.readdirSync(dir).filter(name => name.match(/\.json$/));
    const index = {};
    const langs = [];
    files.forEach(file => {
        const lang = file.replace(/\.json$/, '');
        langs.push(lang);
        let text = require(dir + file);

        for (const id in text) {
            if (text.hasOwnProperty(id)) {
                index[id] = index[id] || {};
                index[id][lang] = text[id] === undefined ? id : text[id];
            }
        }
    });

    const keys = Object.keys(index);
    keys.sort();

    if (!fs.existsSync(dir + '/flat/')) {
        fs.mkdirSync(dir + '/flat/');
    }

    langs.forEach(lang => {
        const words = [];
        keys.forEach(key => {
            words.push(index[key][lang]);
        });
        fs.writeFileSync(dir + '/flat/' + lang + '.txt', words.join('\n'));
    });
    fs.writeFileSync(dir + '/flat/index.txt', keys.join('\n'));
    done();
});

gulp.task('flat=>i18n', done => {
    if (!fs.existsSync(dir + '/flat/')) {
        console.error(dir + '/flat/ directory not found');
        return done();
    }
    const keys = fs.readFileSync(dir + '/flat/index.txt').toString().split(/[\r\n]/);

    const files = fs.readdirSync(dir + '/flat/').filter(name => name.match(/\.txt$/) && name !== 'index.txt');
    const index = {};
    const langs = [];
    files.forEach(file => {
        const lang = file.replace(/\.txt$/, '');
        langs.push(lang);
        let lines = fs.readFileSync(dir + '/flat/' + file).toString().split(/[\r\n]/);
        lines.forEach((word, i) => {
            index[keys[i]] = index[keys[i]] || {};
            index[keys[i]][lang] = word;
        });
    });
    langs.forEach(lang => {
        const words = {};
        keys.forEach(key => {
            words[key] = index[key][lang];
        });
        fs.writeFileSync(dir + '/' + lang + '.json', JSON.stringify(words, null, 2));
    });
});

gulp.task('clean', () => {
    return del([
        'src/node_modules/**/*',
        'src/build/**/*',
        'src/src/version.js',
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

        const cmd = `npm install`;
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

gulp.task('2-npm-dep', ['clean'], () => {
    if (fs.existsSync(__dirname + '/src/node_modules')) {
        return Promise.resolve();
    } else {
        return npmInstall();
    }
});

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

    console.log(options.cwd);

    if (fs.existsSync(__dirname + '/src/node_modules/react-scripts/scripts/build.js')) {
        return gulp.src(__dirname + '/src/node_modules/react-scripts/scripts/build.js')
            .pipe(exec('node <%= file.path %>', options))
            .pipe(exec.reporter(reportOptions)).pipe(connect.reload());
    } else {
        return gulp.src(__dirname + '/node_modules/react-scripts/scripts/build.js')
            .pipe(exec('node <%= file.path %>', options))
            .pipe(exec.reporter(reportOptions)).pipe(connect.reload());

    }
}

gulp.task('3-build', () => {
    return build();
});

gulp.task('3-build-dep', ['2-npm', 'icons', 'version', 'vendorJS'], () => {
    return build();
});

gulp.task('version', done => {
    const pack = require('./package');
    fs.writeFileSync(__dirname + '/src/src/version.js', 'export default \'' + pack.version + '\';');
    done();
});

const ignoreSvgs = ['fireOff.svg'];

gulp.task('icons', done => {
    const dir = __dirname + '/src/src/icons';
    const files = fs.readdirSync(__dirname + '/src/src/icons').filter(e => e.match(/\.svg$/) && ignoreSvgs.indexOf(e) === -1);
    const texts = files.map(file => fs.readFileSync(dir + '/' + file));
    let text = ['import {Component} from "react";'];
    text.push('class IconList extends Component {');
    text.push('    static List = [');
    texts.forEach(file => text.push('       ' + '"data:image/svg+xml;base64,' + Buffer.from(file).toString('base64') + '",'));
    text.push('    ];');
    text.push('}');
    text.push('export default IconList;');
    fs.writeFileSync(dir + '/icons.js', text.join('\n'));
    done();
});

gulp.task('vendorJS', () => {
    return gulp.src([
        'src/public/vendor/*.js',
        '!src/public/vendor/socket.io.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('src/public'));
});

function getHash(data) {
    const md5 = crypto.createHash('md5');
    md5.update(data);

    return md5.digest('hex');
}

function modifyServiceWorker() {
    return new Promise(resolve => {
        try {
            let text = fs.readFileSync(__dirname + '/src/build/service-worker.js');
            if (text.toString().indexOf('vendor.js') === -1) {
                const hash = getHash(text);
                text = text.toString().replace('precacheConfig=[["./index.html"', 'precacheConfig=[["./vendor.js","' + hash + '"],["./index.html"');
                fs.writeFileSync(__dirname + '/src/build/service-worker.js', text);
            }
        } catch (e) {
            console.error('Cannot modify service-worker.js' + e);
        }
        resolve();
    });
}

gulp.task('4-modifyServiceWorker-dep', ['3-build-dep'], () => {
    return modifyServiceWorker();
});

gulp.task('4-modifyServiceWorker', () => {
    return modifyServiceWorker();
});

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

gulp.task('5-copy', ['vendorJS', '4-modifyServiceWorker'], () => {
    return copyFiles();
});

gulp.task('5-copy-dep', ['vendorJS', '4-modifyServiceWorker-dep'], () => {
    return copyFiles();
});

gulp.task('webserver', () => {
    connect.server({
        root: 'src/build',
        livereload: true
    });
});

gulp.task('watch', ['webserver'], () => {
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event
    return watch(['src/src/*/**', 'src/src/*'], { ignoreInitial: true }, ['build']);
});

gulp.task('default', ['5-copy-dep']);