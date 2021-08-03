# Chrode

_Run JavaScript in Chrome, from the command line._

This module is ideal for quickly testing JS code that is written for the browser, without having to first set up a bundler and serving an `index.html`.

DISCLAIMER: This is far from production-ready, but so useful for me in daily development that I needed to make a package out of it.

```sh
npm i chrode # install
npx chrode script.js # run your script
```

Chrode uses `esbuild` to bundle your code before executing it in headless Chrome with `puppeteer`. Some benefits:

* Resolving ESM / require imports from `node_modules` just works
* Automatically handles TypeScript and JSX
* Can be used in re-executing watch mode like `nodemon`

We also add some custom `esbuild` plugins to make it easy to run performance-oriented scripts which use [WebAssembly](#webassembly) and [Web Workers](#web-workers).

## CLI

```sh
npx chrode script.js
npx chrodemon script.js # same as `npx chrode script.js --watch`
```

### Options

```
  -h, --help            Print this information.
  -w, --watch           Re-execute on file changes
  -s, --silent          Do not forward console logs to stdout.
  --incognito           Run in an incognito browser context.
  --no-headless         Open the Chrome browser UI that runs your scripts.
```

### Build only

If you only want the bundle produced by Chrode without running it, you can use the `chrode-build` CLI:

```sh
npx chrode-build script.js
```

This will pipe the build output to the command-line. Note that this is just a far less powerful wrapper around `esbuild` with the added convenience of our ready-to-use setup and plugins. The bundle that is produced is an ES module without imports and exports, suitable for inclusion in a `<script type="module">`, or for executing with `deno` or even `node` if you avoid incompatible Browser APIs.

A more useful build command is exposed in our JavaScript API:

## JavaScript API

```js
import {run, build} from 'chrode';

// same as `chrode script.js`
run('./script.js');

// with advanced options (same meaning as above)
run('./script.js', {
  watch: true,
  silent: true,
  incognito: true,
  noHeadless: false,
});

// build only
// the second parameter is an object that directly overrides our input to esbuild.build(...)
let script = await build('./script.js', {minify: true});
```

## WebAssembly

You can simply import `.wasm` and `.wat` files directly. Both will resolve with a string which holds the base64-encoded WebAssembly bytecode. `.wat` is converted to `.wasm` behind the scenes.

```js
import wasmBase64 from './example.wasm';

// base64-decode
let wasmStr = atob(wasm64);
let wasmBytes = new Uint8Array([...wasmStr].map((_, i) => wasmStr.charCodeAt(i)));

// instantiate
let wasmInstance = await WebAssembly.instantiate(wasmBytes);
```

## Web Workers

Files with a `.worker.js` extension will be resolved by inlining the worker code and exporting a constructor for the worker, without URL. This makes it more convenient to play around with multi-threaded JavaScript, especially if you want to bundle your code as a library.

```js
// script.worker.js
postMessage('hello from worker!');
```

```js
// script.js
import Worker from './script.worker.js';
let worker = Worker();
worker.onmessage = ({data}) => console.log(data);
```

When `script.js` is run with Chrode, this prints `"hello from worker!"`.


## Filesystem access

Your scripts can access files on your hard-drive via `fetch`. The path is resolved relative to the folder where Chrode is run. Example:

```js
let res = await fetch('./package.json')
let packageJson = await res.json();
console.log(packageJson.name);
```

When executed with Chrode, this prints the name in your `package.json`.

## How does it all work?

- We bundle your script using `esbuild` (with custom plugins for WebAssembly and Web Workers)
- We start a browser context with `puppeteer` which loads a dummy html page including the bundled script.
- A static file server serves your current folder to the page
- We forward `console` calls and errors in the browser to your console (with puppeteer).
- For `chrodemon`, we run `esbuild` in watch mode and reload the page on changes

## What does it mean?

`chrode = chrome + node`, because it runs scripts, like node, but in chrome.
