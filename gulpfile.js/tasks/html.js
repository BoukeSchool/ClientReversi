const {src, dest} = require('gulp');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');


const html = function () {
    return function () {
        return src(['index.html'])
            .pipe(htmlmin({
                collapseWhitespace: true,
                minifyJS: true,
                minifyCSS: true,
                removeComments: true
            }))
            .pipe(rename(function (path) {
                path.dirname += "/";
                path.basename = 'index';
                path.extname = ".html";
            }))
            .pipe(dest('./dist/html'))
    }
};

exports.html = html;