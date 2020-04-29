
# Resave Sass

A middleware for compiling and saving [Sass](https://sass-lang.com/) files. Use [Express](https://expressjs.com/). Built with [Resave](https://github.com/rowanmanning/resave).

```js
const express = require('express');
const resaveSass = require('resave-sass');

const app = express();

app.use(express.static('./public'));
app.use(resaveSass({
    bundles: {
        '/main.css': './source/main.scss'
    },
    savePath: './public'
}));

app.listen(3000);
```

## Table of Contents

  * [Requirements](#requirements)
  * [Usage](#usage)
    * [Getting started](#getting-started)
    * [Options](#options)
  * [Contributing](#contributing)
  * [License](#license)


## Requirements

This library requires the following to run:

  * [Node.js](https://nodejs.org/) 12+


## Usage

Install with [npm](https://www.npmjs.com/):

```sh
npm install resave
```

### Getting started

Load the library into your code with a `require` call:

```js
const resaveSass = require('resave-sass');
```

Use the created middleware in your application:

```js
const express = require('express');

const app = express();

app.use(resaveSass({
    bundles: {
        '/main.css': './source/main.scss'
    }
}));
```

In the example above, requests to `/main.css` will load the file `./source/main.scss`, run it through Sass, and serve it up.

This isn't great in production environments as it can be quite slow. In these cases you can save the output to a file which will get served by another middleware:

```js
const express = require('express');
const serveStatic = require('serve-static');

const app = express();

app.use(express.static('./public'));

app.use(resaveSass({
    bundles: {
        '/main.css': './source/main.scss'
    },
    savePath: './public'
}));
```

In the example above the first time `/main.css` is requested it will get compiled and saved into `public/main.css`. On the next request, the `express.static` middleware will find the created file and serve it up with your configured caching etc.

### Options

#### `basePath` (string)

The directory to look for sass files in. Defaults to `process.cwd()`.

#### `bundles` (object)

A map of bundle URLs and source paths, where each key is the URL path that the bundle is served on, and each value is the location of the entry point Sass source file for that bundle. The source paths are relative to the `basePath` option.

In the following example requests to `/foo.css` will load, compile and serve `source/foo.scss`:

```js
app.use(resaveSass({
    basePath: 'source'
    bundles: {
        '/foo.js': 'foo.scss'
    }
}));
```

#### `cssOutputStyle` (string)

The style of CSS to output. One of "expanded", "compressed".

#### `enableSourceMaps` (boolean)

Whether to output source maps for the compiled CSS files. If the `savePath` option is
specified, then the source map will be saved alongside the CSS appended with `.map`; if
`savePath` is not specified, then source maps will be inlined. Defaults to `true`.

#### `log` (object)

An object which implments the methods `error` and `info` which will be used to report errors and information.

```js
app.use(resaveSass({
    log: console
}));
```

#### `sassIncludePaths` (array of strings)

An array of paths that Sass can look in to attempt to resolve your `@import` and `@use` declarations. You can always import using URLs relative to the current Sass file. Defaults to an empty array.

#### `savePath` (string)

The directory to save compiled CSS files to. This is optional, but is recommended in
production environments. This should point to a directory which is also served by your
application. Defaults to `null`.

Example of saving bundles only in production:

```js
app.use(resaveSass({
    savePath: (process.env.NODE_ENV === 'production' ? './public' : null)
}));
```


## Examples

### Basic Example

Bundle some Sass files together and serve them up.

```
node example/basic
```


## Contributing

To contribute to this library, clone this repo locally and commit your code on a separate branch. Please write unit tests for your code, and run the linter before opening a pull-request:

```sh
make test    # run all tests
make verify  # run all linters
```


## License

Licensed under the [MIT](LICENSE) license.<br/>
Copyright &copy; 2020, Rowan Manning
