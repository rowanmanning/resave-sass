
Resave Sass
===========

A middleware for compiling and saving [Sass][sass] files. Use with [Connect][connect] or [Express][express] and [static middleware][serve-static]. Built with [Resave][resave].

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![Dependencies][shield-dependencies]][info-dependencies]
[![MIT licensed][shield-license]][info-license]

```js
var connect = require('connect');
var resaveSass = require('resave-sass');
var serveStatic = require('serve-static');

var app = connect();

app.use(serveStatic('./public'));
app.use(resaveSass({
    bundles: {
        '/main.css': './source/main.scss'
    },
    savePath: './public'
}));

app.listen(3000);
```


Table Of Contents
-----------------

- [Install](#install)
- [Getting Started](#getting-started)
- [Options](#options)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)


Install
-------

Install Resave Sass with [npm][npm]:

```sh
npm install resave-sass
```


Getting Started
---------------

Require in Resave Sass:

```js
var resaveSass = require('resave-sass');
```

Use the created middleware in your application:

```js
var connect = require('connect');

var app = connect();

app.use(resaveSass({
    bundles: {
        '/main.css': './source/main.scss'
    }
}));
```

In the example above, requests to `/main.css` will load the file `./source/main.scss`, run it through Sass, and serve it up.

This isn't great in production environments as it can be quite slow. In these cases you can save the output to a file which will get served by another middleware:

```js
var connect = require('connect');
var serveStatic = require('serve-static');

var app = connect();

app.use(serveStatic('./public'));

app.use(resaveSass({
    bundles: {
        '/main.css': './source/main.scss'
    },
    savePath: './public'
}));
```

In the example above the first time `/main.css` is requested it will get compiled and saved into `public/main.css`. On the next request, the `serve-static` middleware will find the created file and serve it up with proper caching etc.


Options
-------

#### `basePath` (string)

The directory to look for bundle files in. Defaults to `process.cwd()`.

#### `sass` (object)

A configuration object which will get passed into Sass. See the [Sass options documentation][sass-opts] for more information.

If `NODE_ENV` is `'production'`, it defaults to:

```js
{
    sourceMap: false,
    sourceMapEmbed: false,
    sourceMapContents: false
}
```

If `NODE_ENV` is *not* `'production'`, it defaults to:

```js
{
    sourceMap: true,
    sourceMapEmbed: true,
    sourceMapContents: true
}
```

#### `bundles` (object)

A map of bundle URLs and source paths. The source paths are relative to the `basePath` option. In the following example requests to `/foo.css` will load, compile and serve `source/foo.scss`:

```js
app.use(resaveSass({
    basePath: 'source'
    bundles: {
        '/foo.js': 'foo.scss'
    }
}));
```

#### `log` (object)

An object which implments the methods `error` and `info` which will be used to report errors and information.

```js
app.use(resaveSass({
    log: console
}));
```

#### `savePath` (string)

The directory to save bundled files to. This is optional, but is recommended in production environments. This should point to a directory which is also served by your application. Defaults to `null`.

Example of saving bundles only in production:

```js
app.use(resaveSass({
    savePath: (process.env.NODE_ENV === 'production' ? './public' : null)
}));
```


Examples
--------

### Basic Example

Bundle some Sass files together and serve them up.

```
node example/basic
```


Contributing
------------

To contribute to Resave Sass, clone this repo locally and commit your code on a separate branch.

Please write unit tests for your code, and check that everything works by running the following before opening a pull-request:

```sh
make lint test
```


License
-------

Resave Sass is licensed under the [MIT][info-license] license.  
Copyright &copy; 2015, Rowan Manning



[sass]: https://github.com/sass/node-sass
[sass-opts]: https://github.com/sass/node-sass#options
[connect]: https://github.com/senchalabs/connect
[express]: http://expressjs.com/
[npm]: https://npmjs.org/
[resave]: https://github.com/rowanmanning/resave
[serve-static]: https://github.com/expressjs/serve-static

[info-dependencies]: https://gemnasium.com/rowanmanning/resave-sass
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/resave-sass
[info-build]: https://travis-ci.org/rowanmanning/resave-sass
[shield-dependencies]: https://img.shields.io/gemnasium/rowanmanning/resave-sass.svg
[shield-license]: https://img.shields.io/badge/license-MIT-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-0.10–4-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/resave-sass.svg
[shield-build]: https://img.shields.io/travis/rowanmanning/resave-sass/master.svg
