'use strict';

const config = module.exports = JSON.parse(JSON.stringify(require('../.eslintrc')));

config.rules = config.rules || {};
config.rules['max-len'] = 'off';
config.rules['max-statements'] = 'off';
