'use strict';

var sass = require('node-sass');
var extend = require('node.extend');
var resave = require('resave');
var isProduction = (process.env.NODE_ENV === 'production');

module.exports = resave(function (bundlePath, options, done) {
    var sassOptions = defaultSassOptions(options.sass);
    sassOptions.file = sassOptions.outFile = bundlePath;
    sass.render(sassOptions, function (error, result) {
        if (error) {
            return done(error);
        }
        done(null, result.css);
    });
});

module.exports.defaults = {
    sourceMap: !isProduction,
    sourceMapEmbed: !isProduction,
    sourceMapContents: !isProduction
};

function defaultSassOptions (options) {
    options = extend(true, {}, module.exports.defaults, options);
    return options;
}
