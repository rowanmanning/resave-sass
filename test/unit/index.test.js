'use strict';

const assert = require('proclaim');

describe('index', () => {
	let index;
	let resaveSass;

	beforeEach(() => {
		index = require('../../index');
		resaveSass = require('../../lib/resave-sass');
	});

	it('aliases `lib/resave-sass`', () => {
		assert.strictEqual(index, resaveSass);
	});

});
