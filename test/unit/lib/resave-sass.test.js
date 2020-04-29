'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/resave-sass', () => {
	let fs;
	let resave;
	let resaveSass;
	let sass;

	beforeEach(() => {
		fs = require('../mock/node/fs');
		mockery.registerMock('fs', fs);

		sass = require('../mock/npm/sass');
		mockery.registerMock('sass', sass);

		resave = require('../mock/npm/resave');
		mockery.registerMock('resave', resave);

		resaveSass = require('../../../lib/resave-sass');
	});

	it('creates a resave middleware', () => {
		assert.calledOnce(resave);
		assert.isFunction(resave.firstCall.args[0]);
	});

	it('exports the resave middleware', () => {
		assert.strictEqual(resaveSass, resave.mockResaver);
	});

	describe('createBundle(bundleInfo)', () => {
		let creatBundle;
		let options;
		let defaultedOptions;
		let resolvedValue;
		let sassRenderResult;

		beforeEach(async () => {
			options = {
				isUserOptions: true
			};
			defaultedOptions = {
				isDefaultOptions: true,
				log: {
					error: sinon.spy(),
					info: sinon.spy()
				},
				enableSourceMaps: true,
				cssOutputStyle: 'mock-css-output-style',
				sassIncludePaths: ['mock-sass-include-path']
			};
			sinon.stub(Object, 'assign').returns(defaultedOptions);

			sassRenderResult = {
				css: 'mock-css',
				map: 'mock-source-map'
			};
			sass.render.yieldsAsync(null, sassRenderResult);

			creatBundle = resave.firstCall.args[0];
			resolvedValue = await creatBundle({
				options,
				savePath: 'mock-save-path',
				sourcePath: 'mock-source-path'
			});
		});

		afterEach(() => {
			Object.assign.restore();
		});

		it('defaults the options', () => {
			assert.calledOnce(Object.assign);
			assert.isObject(Object.assign.firstCall.args[0]);
			assert.strictEqual(Object.assign.firstCall.args[1], resaveSass.defaultOptions);
			assert.strictEqual(Object.assign.firstCall.args[2], options);
		});

		it('renders CSS using the given Sass source file, and the specified options', () => {
			assert.calledOnce(sass.render);
			assert.calledWith(sass.render, {
				file: 'mock-source-path',
				includePaths: ['mock-sass-include-path'],
				outFile: 'mock-save-path',
				outputStyle: 'mock-css-output-style',
				sourceMap: true,
				sourceMapContents: true
			});
			assert.isFunction(sass.render.firstCall.args[1]);
		});

		it('writes the source map file to the file system, next to the CSS save path', () => {
			assert.calledOnce(fs.promises.writeFile);
			assert.calledWithExactly(fs.promises.writeFile, 'mock-save-path.map', 'mock-source-map');
		});

		it('resolves with the rendered CSS', () => {
			assert.strictEqual(resolvedValue, 'mock-css');
		});

		describe('when source maps are disabled', () => {

			beforeEach(async () => {
				defaultedOptions.enableSourceMaps = false;
				sass.render.resetHistory();
				fs.promises.writeFile.resetHistory();
				resolvedValue = await creatBundle({
					options,
					savePath: 'mock-save-path',
					sourcePath: 'mock-source-path'
				});
			});

			it('renders CSS using the given Sass source file, not creating source maps', () => {
				assert.calledOnce(sass.render);
				assert.calledWith(sass.render, {
					file: 'mock-source-path',
					includePaths: ['mock-sass-include-path'],
					outFile: 'mock-save-path',
					outputStyle: 'mock-css-output-style'
				});
				assert.isFunction(sass.render.firstCall.args[1]);
			});

			it('does not write the source map file to the file system', () => {
				assert.notCalled(fs.promises.writeFile);
			});

			it('resolves with the rendered CSS', () => {
				assert.strictEqual(resolvedValue, 'mock-css');
			});

		});

		describe('when a save path is not specified', () => {

			beforeEach(async () => {
				sass.render.resetHistory();
				fs.promises.writeFile.resetHistory();
				resolvedValue = await creatBundle({
					options,
					savePath: null,
					sourcePath: 'mock-source-path'
				});
			});

			it('renders CSS using the given Sass source file, creating inline source maps', () => {
				assert.calledOnce(sass.render);
				assert.calledWith(sass.render, {
					file: 'mock-source-path',
					includePaths: ['mock-sass-include-path'],
					outFile: 'mock-source-path',
					outputStyle: 'mock-css-output-style',
					sourceMap: true,
					sourceMapContents: true,
					sourceMapEmbed: true
				});
				assert.isFunction(sass.render.firstCall.args[1]);
			});

			it('does not write the source map file to the file system', () => {
				assert.notCalled(fs.promises.writeFile);
			});

			it('resolves with the rendered CSS', () => {
				assert.strictEqual(resolvedValue, 'mock-css');
			});

		});

		describe('when sass rendering fails', () => {
			let caughtError;
			let sassRenderError;

			beforeEach(async () => {
				sassRenderError = new Error('mock sass render error');
				sass.render.resetHistory();
				sass.render.yieldsAsync(sassRenderError);
				fs.promises.writeFile.resetHistory();
				resolvedValue = undefined;
				try {
					resolvedValue = await creatBundle({
						options,
						savePath: 'mock-save-path',
						sourcePath: 'mock-source-path'
					});
				} catch (error) {
					caughtError = error;
				}
			});

			it('does not write the source map file to the file system', () => {
				assert.notCalled(fs.promises.writeFile);
			});

			it('rejects with the sass render error', () => {
				assert.strictEqual(caughtError, sassRenderError);
			});

			it('does not resolve with anything', () => {
				assert.isUndefined(resolvedValue);
			});

		});

		describe('when writing the source map fails', () => {
			let caughtError;
			let writeError;

			beforeEach(async () => {
				writeError = new Error('mock write error');
				writeError.stack = 'mock write error stack';
				sass.render.resetHistory();
				fs.promises.writeFile.resetHistory();
				fs.promises.writeFile.rejects(writeError);
				resolvedValue = undefined;
				try {
					resolvedValue = await creatBundle({
						options,
						savePath: 'mock-save-path',
						sourcePath: 'mock-source-path'
					});
				} catch (error) {
					caughtError = error;
				}
			});

			it('logs that the write failed', () => {
				assert.calledWith(defaultedOptions.log.error, 'Sass sourcemap failed to write: mock write error stack');
			});

			it('does not reject with the write error', () => {
				assert.isUndefined(caughtError);
			});

			it('resolves with the rendered CSS', () => {
				assert.strictEqual(resolvedValue, 'mock-css');
			});

		});

	});

	describe('.defaultOptions', () => {
		let defaultOptions;

		beforeEach(() => {
			defaultOptions = resaveSass.defaultOptions;
		});

		it('is an object', () => {
			assert.isObject(defaultOptions);
		});

		it('has an `enableSourceMaps` property', () => {
			assert.isTrue(defaultOptions.enableSourceMaps);
		});

		it('has a `cssOutputStyle` property', () => {
			assert.strictEqual(defaultOptions.cssOutputStyle, 'compressed');
		});

		it('has a `sassIncludePaths` property', () => {
			assert.isArray(defaultOptions.sassIncludePaths);
			assert.lengthEquals(defaultOptions.sassIncludePaths, 0);
		});

	});

});
