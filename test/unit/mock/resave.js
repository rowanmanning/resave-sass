'use strict';

var sinon = require('sinon');

var resave = module.exports = sinon.stub();
resave.mockReturn = sinon.stub();
resave.returns(resave.mockReturn);
