'use strict';

const connect = require('connect');
const fs = require('fs');
const resaveSass = require('../..');
const serveStatic = require('serve-static');

// Remove the existing example.css if there is one (just for the example!)
try {
    fs.unlinkSync(`${__dirname}/public/example.css`);
} catch (error) {}

// Create a connect application
const app = connect();

// Use the serve-static middleware. This will serve the created
// file after the first compile
app.use(serveStatic(`${__dirname}/public`));

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

// Use a dummy error handler
app.use((error, request, response, next) => {
    // jshint unused: false
    response.writeHead(500);
    response.end(`500 Server Error:\n\n${error.stack}`);
});

// Listen on a port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Application running on port %s', port);
    console.log('Visit http://localhost:%s/ in your browser', port);
});
