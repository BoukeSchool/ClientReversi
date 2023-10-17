const {src, dest} = require('gulp');
const concat = require('gulp-concat');


const vendor = function (serverProjectPath, vendorFiles) {
    return function () {
        return src(vendorFiles)
            .pipe(concat('vendor.js'))
            .pipe(dest('dist/js/vendor'))
            .pipe(dest(serverProjectPath + 'js/vendor'));
    }
};

exports.vendor = vendor;