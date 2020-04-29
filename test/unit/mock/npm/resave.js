'use strict';

const sinon = require('sinon');

const resave = module.exports = sinon.stub();
resave.mockResaver = sinon.stub();
resave.returns(resave.mockResaver);
