# Chrode

_Run JavaScript in Chrome, from the command line._

DISCLAIMER: This is far from production-ready, it's a quick one-off that I thought would be useful for me, so I made a package out of it.

```sh
npm i chrode # install locally
npm i -g chrode # install globally
```

## CLI

```sh
chrode script.js
chrodemon script.js # same as `chrode script.js --watch`
```

### Options

```
  -h, --help            Print this information.
  -w, --watch           Re-execute on file changes (same as the chrodemon command)
  --incognito           Use an incognito browser context.
  --no-logs             Do not forward console logs to stdout.
  --no-headless         Open the Chrome browser UI that runs your scripts.
```

## As a module

```js
import chrode from 'chrode';

chrode('./script.js');

// with advanced options (same meaning as above)
chrode('./script.js', {
  watch: true,
  incognito: true,
  noLogs: true,
  noHeadless: false,
});
```

## How does it work?

- We bundle your script using `esbuild`
- We start a browser context with `puppeteer` which loads a dummy html page including the bundled script.
- We forward `console` calls and errors in the browser to your console (with puppeteer).
- For `chrodemon`, we run `esbuild` in watch mode and reload the page on changes

## What does it mean?

`chrode = chrome + node`, because it runs scripts, like node, but in chrome.
