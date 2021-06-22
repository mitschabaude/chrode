# Chrode

_Run JavaScript in Chrome, from the command line._

DISCLAIMER: This is far from production-ready, it's a quick one-off that I thought would be useful for me, so I made a package out of it.

```sh
npm i chrode # install locally
npm i -g chrode # install globally
```

## CLI

```sh
chrode script.js [-n 5]
```

### Options

```
  -n, --number number   The number of parallel executions (default: 1).
  -h, --help            Print this information.
  --no-logs             Do not forward console logs to stdout.
  --no-incognito        Do not use an incognito browser context.
  --no-parallel         Do not load scripts in parallel.
  --no-headless         Open the browser UI that runs your scripts.
```

## As a module

```js
import chrode from 'chrode';

chrode('./script.js');

// multiple parallel executions
chrode('./script.js', 5);

// with advanced options (same meaning as above)
chrode('./script.js', 1, {
  noIncognito: true,
  noParallel: true,
  noHeadless: true,
});
```

## How does it work?

- We bundle your script using `esbuild`
- We start a browser context with `puppeteer` which loads a dummy html page and adds the bundled script.
- We forward `console` calls in the browser to your console (with puppeteer).

## What does it mean?

`chrode = chrome + node`, because it runs scripts, like node, but in chrome.
