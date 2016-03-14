// jscs:disable maximumLineLength
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/resave-sass', () => {
    let extend;
    let resave;
    let resaveSass;
    let sass;

    beforeEach(() => {

        extend = sinon.stub();
        mockery.registerMock('node.extend', extend);

        sass = require('../mock/sass');
        mockery.registerMock('node-sass', sass);

        resave = require('../mock/resave');
        mockery.registerMock('resave', resave);

        resaveSass = require('../../../lib/resave-sass');

    });

    it('should create a resave middleware', () => {
        assert.calledOnce(resave);
        assert.isFunction(resave.firstCall.args[0]);
    });

    it('should export the resave middleware', () => {
        assert.strictEqual(resaveSass, resave.mockReturn);
    });

    it('should have a `defaults` property', () => {
        assert.isObject(resaveSass.defaults);
    });

    describe('.defaults', () => {
        let defaults;

        beforeEach(() => {
            defaults = resaveSass.defaults;
        });

        it('should have a `sourceMap` property', () => {
            if (process.env.NODE_ENV === 'production') {
                assert.isFalse(defaults.sourceMap);
            }
            else {
                assert.isTrue(defaults.sourceMap);
            }
        });

        it('should have a `sourceMapEmbed` property', () => {
            if (process.env.NODE_ENV === 'production') {
                assert.isFalse(defaults.sourceMapEmbed);
            }
            else {
                assert.isTrue(defaults.sourceMapEmbed);
            }
        });

        it('should have a `sourceMapContents` property', () => {
            if (process.env.NODE_ENV === 'production') {
                assert.isFalse(defaults.sourceMapContents);
            }
            else {
                assert.isTrue(defaults.sourceMapContents);
            }
        });

    });

    describe('resave `creatBundle` function', () => {
        let bundlePath;
        let creatBundle;
        let done;
        let options;
        let sassOptions;
        let sassResult;

        beforeEach(() => {
            bundlePath = 'foo';
            options = {
                sass: {
                    foo: 'bar'
                }
            };
            done = sinon.spy();
            sassOptions = {
                foo: 'bar'
            };
            extend.returns(sassOptions);
            sassResult = {
                css: 'css'
            };
            sass.render.yields(null, sassResult);
            creatBundle = resave.firstCall.args[0];
            creatBundle(bundlePath, options, done);
        });

        it('should default the sass options', () => {
            assert.calledOnce(extend);
            assert.isTrue(extend.firstCall.args[0]);
            assert.isObject(extend.firstCall.args[1]);
            assert.strictEqual(extend.firstCall.args[2], resaveSass.defaults);
            assert.strictEqual(extend.firstCall.args[3], options.sass);
        });

        it('should create a sass bundle with the expected options', () => {
            assert.calledOnce(sass.render);
            assert.deepEqual(sass.render.firstCall.args[0], {
                file: bundlePath,
                foo: 'bar',
                outFile: bundlePath
            });
        });

        it('should callback with the generated CSS', () => {
            assert.calledOnce(done);
            assert.calledWith(done, null, sassResult.css);
        });

        it('should callback with an error if compilation is unsuccessful', () => {
            const error = new Error('...');
            done.reset();
            sass.render.yields(error);
            creatBundle(bundlePath, options, done);
            assert.calledOnce(done);
            assert.calledWith(done, error);
        });

    });

});
