'use strict';

const sass = require('node-sass');
const extend = require('node.extend');
const resave = require('resave');
const isProduction = (process.env.NODE_ENV === 'production');

module.exports = resave((bundlePath, options, done) => {
    const sassOptions = defaultSassOptions(options.sass);
    sassOptions.file = sassOptions.outFile = bundlePath;
    sass.render(sassOptions, (error, result) => {
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
    return extend(true, {}, module.exports.defaults, options);
}
