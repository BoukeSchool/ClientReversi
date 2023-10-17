const {src, dest} = require('gulp');
const order = require('gulp-order');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const minify = require('gulp-minify');

const fn = function (backendPath, filesJs, filesJsOrder) {
    return function () {
        return src(filesJs)
            .pipe(order(filesJsOrder, {base: './'}))
            .pipe(concat('app.js'))
            .pipe(babel({
                presets: ['@babel/preset-env']
            }))
            .pipe(minify())
            .pipe(uglify({compress: true}))
            .pipe(dest('./dist/js'))
            .pipe(dest(backendPath + 'js'))
    }
};
exports.js = fn;