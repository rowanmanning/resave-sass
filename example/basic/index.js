'use strict';

const express = require('express');
const resaveSass = require('../..');
const {unlinkSync} = require('fs');

// Remove the existing example.css if there is one (just for the example!)
try {
	unlinkSync(`${__dirname}/public/example.css`);
	unlinkSync(`${__dirname}/public/example.css.map`);
} catch (error) {}

// Create an Express application
const app = express();

// Use the static middleware. This will serve the created
// file after the first compile
app.use(express.static(`${__dirname}/public`));

// Use the middleware
app.use(resaveSass({
	basePath: `${__dirname}/source`,
	bundles: {
		'/example.css': 'example.scss'
	},
	log: {
		error: console.log.bind(console),
		info: console.log.bind(console)
	},
	savePath: `${__dirname}/public`
}));

// Listen on a port
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('Application running on port %s', port);
	console.log('Visit http://localhost:%s/ in your browser', port);
});
