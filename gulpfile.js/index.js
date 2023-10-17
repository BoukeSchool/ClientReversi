const config = require('./config');
const { watch } = require('gulp');
const { series } = require('gulp');


const js = require('./tasks/js').js(config.localServerProjectPath, config.files.js, config.files.js);
    js.displayName = 'js';

const vendor = require('./tasks/vendor').vendor(config.localServerProjectPath, config.files.vendor);
    vendor.displayName = 'vendor';

const html = require('./tasks/html').html();
    html.displayName = 'html';

const sass = require('./tasks/sass').sass(config.localServerProjectPath, config.files.sass);
    sass.displayName = 'sass';

const templates = require('./tasks/templates').templates(config.localServerProjectPath, config.files.templates, config.files.partials);
    templates.displayName = 'templates'

const hello = function (done) {
    console.log(`Groeten van ${config.localServerProjectPath}!`)
    done();
}

const watchFiles = () => {
    watch(['./css/*.scss', './features/**/*.scss'], series(sass));

};


exports.default = hello;
exports.watch = watchFiles;
exports.js = js;
exports.vendor = vendor;
exports.html = html;
exports.sass = sass;
exports.templates = templates;