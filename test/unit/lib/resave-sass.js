// jshint maxstatements: false
// jscs:disable disallowMultipleVarDecl, maximumLineLength
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('lib/resave-sass', function () {
    var extend, resave, resaveSass, sass;

    beforeEach(function () {

        extend = sinon.stub();
        mockery.registerMock('node.extend', extend);

        sass = require('../mock/sass');
        mockery.registerMock('node-sass', sass);

        resave = require('../mock/resave');
        mockery.registerMock('resave', resave);

        resaveSass = require('../../../lib/resave-sass');

    });

    it('should create a resave middleware', function () {
        assert.calledOnce(resave);
        assert.isFunction(resave.firstCall.args[0]);
    });

    it('should export the resave middleware', function () {
        assert.strictEqual(resaveSass, resave.mockReturn);
    });

    it('should have a `defaults` property', function () {
        assert.isObject(resaveSass.defaults);
    });

    describe('.defaults', function () {
        var defaults;

        beforeEach(function () {
            defaults = resaveSass.defaults;
        });

        it('should have a `sourceMap` property', function () {
            if (process.env.NODE_ENV === 'production') {
                assert.isFalse(defaults.sourceMap);
            }
            else {
                assert.isTrue(defaults.sourceMap);
            }
        });

        it('should have a `sourceMapEmbed` property', function () {
            if (process.env.NODE_ENV === 'production') {
                assert.isFalse(defaults.sourceMapEmbed);
            }
            else {
                assert.isTrue(defaults.sourceMapEmbed);
            }
        });

        it('should have a `sourceMapContents` property', function () {
            if (process.env.NODE_ENV === 'production') {
                assert.isFalse(defaults.sourceMapContents);
            }
            else {
                assert.isTrue(defaults.sourceMapContents);
            }
        });

    });

    describe('resave `creatBundle` function', function () {
        var bundlePath, creatBundle, done, options, sassOptions, sassResult;

        beforeEach(function () {
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

        it('should default the sass options', function () {
            assert.calledOnce(extend);
            assert.isTrue(extend.firstCall.args[0]);
            assert.isObject(extend.firstCall.args[1]);
            assert.strictEqual(extend.firstCall.args[2], resaveSass.defaults);
            assert.strictEqual(extend.firstCall.args[3], options.sass);
        });

        it('should create a sass bundle with the expected options', function () {
            assert.calledOnce(sass.render);
            assert.deepEqual(sass.render.firstCall.args[0], {
                file: bundlePath,
                foo: 'bar',
                outFile: bundlePath
            });
        });

        it('should callback with the generated CSS', function () {
            assert.calledOnce(done);
            assert.calledWith(done, null, sassResult.css);
        });

        it('should callback with an error if compilation is unsuccessful', function () {
            var error = new Error('...');
            done.reset();
            sass.render.yields(error);
            creatBundle(bundlePath, options, done);
            assert.calledOnce(done);
            assert.calledWith(done, error);
        });

    });

});
