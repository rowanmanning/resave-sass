'use strict';

const sass = require('sass');
const resave = require('resave');
const {promisify} = require('util');
const {writeFile} = require('fs').promises;

/**
 * Promisified `sass.render`.
 *
 * @access private
 * @param {Object} options
 *     Options to pass into `sass.render`
 * @returns {Promise<Object>}
 *     Resolves with the result of `sass.render`.
 */
const renderSass = promisify(sass.render);

/**
 * Create a Resave Sass middleware.
 *
 * @name resaveSass
 * @param {Object} [options={}]
 *     An options object used to configure the middleware.
 * @param {String} [options.basePath='<CWD>']
 *     The directory to look for source files in. Prepended to bundle paths.
 *     Defaults to `process.cwd()`.
 * @param {Object.<String,String>} [options.bundles={}]
 *     A map of bundle URLs and source paths, where each key is the URL path that the bundle
 *     is served on, and each value is the location of the entry point Sass source file for
 *     that bundle. The source paths are relative to the `basePath` option.
 * @param {String} [options.cssOutputStyle="compressed"]
 *     The style of CSS to output. One of "expanded", "compressed".
 * @param {Boolean} [options.enableSourceMaps=true]
 *     Whether to output source maps for the compiled CSS files. If the `savePath` option is
 *     specified, then the source map will be saved alongside the CSS appended with `.map`; if
 *     `savePath` is not specified, then source maps will be inlined.
 * @param {Object} [options.log]
 *     An object with log methods.
 * @param {Function} [options.log.info]
 *     A function used to log information.
 * @param {Function} [options.log.error]
 *     A function used to log errors.
 * @param {Array<String>} [options.sassIncludePaths=[]]
 *     An array of paths that Sass can look in to attempt to resolve your `@import` and `@use`
 *     declarations. You can always import using URLs relative to the current Sass file.
 * @param {String} [options.savePath=null]
 *     The directory to save compiled CSS files to. This is optional, but is recommended in
 *     production environments. This should point to a directory which is also served by your
 *     application.
 * @returns {ExpressMiddleware}
 *     Returns an Express middleware function.
 */
module.exports = resave(async ({options, savePath, sourcePath}) => {

	// Default the options
	options = applyDefaultOptions(options);
	const sassOptions = {
		file: sourcePath,
		includePaths: options.sassIncludePaths,
		outFile: (savePath ? savePath : sourcePath),
		outputStyle: options.cssOutputStyle
	};

	// Use source maps if they're switched on
	if (options.enableSourceMaps) {
		sassOptions.sourceMap = true;
		sassOptions.sourceMapContents = true;

		// If there's no save path, embed source maps in the output CSS
		if (!savePath) {
			sassOptions.sourceMapEmbed = true;
		}
	}

	// Render the CSS from Sass input
	const result = await renderSass(sassOptions);

	// If there's a save path and source maps are enabled,
	// save a source map. We don't await this, as we don't
	// want it to hold up the output of the CSS
	if (options.enableSourceMaps && savePath) {
		writeFile(`${savePath}.map`, result.map).catch(writeError => {
			options.log.error(`Sass sourcemap failed to write: ${writeError.stack}`);
		});
	}

	// Return the rendered CSS
	return result.css;
});

/**
 * A middleware function.
 * @callback ExpressMiddleware
 * @param {Object} request
 *     An Express Request object.
 * @param {Object} response
 *     An Express Response object.
 * @param {ExpressMiddlewareCallback} next
 *     A callback function.
 * @returns {undefined}
 *     Returns nothing.
 */

/**
 * A callback function.
 * @callback ExpressMiddlewareCallback
 * @param {Error} error
 *     An HTTP error.
 * @returns {undefined}
 *     Returns nothing.
 */

/**
 * Default options to be used in Sass middleware.
 *
 * @access private
 * @type {Object}
 */
module.exports.defaultOptions = {
	enableSourceMaps: true,
	cssOutputStyle: 'compressed',
	sassIncludePaths: []
};

/**
 * Apply default values to a set of user-provided options.
 * Used internally by {@link resaveSass}.
 *
 * @access private
 * @param {Object} [userOptions={}]
 *     Options to add on top of the defaults. See {@link resaveSass}.
 * @returns {Object}
 *     Returns the defaulted options.
 */
function applyDefaultOptions(userOptions) {
	return Object.assign({}, module.exports.defaultOptions, userOptions);
}
