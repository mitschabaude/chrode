import puppeteer from 'puppeteer';
import {readFile} from 'fs/promises';
import {readFileSync} from 'fs';
import path from 'path';
// import {performance} from 'perf_hooks';
import {createServer} from 'http';
import {Server} from 'node-static';
import chalk from 'chalk';
import esbuild from 'esbuild';
import watPlugin from 'esbuild-plugin-wat';
import inlineWorkerPlugin from 'esbuild-plugin-inline-worker';
import findCacheDir from 'find-cache-dir';
import subpathImportPlugin from './esbuild-plugin-subpath-imports.js';

let {bold, red, yellow} = chalk;

const fileServer = new Server('.');
let cacheDir = findCacheDir({name: 'chrode', create: true});

export {run, build};

async function run(
  scriptPath,
  {
    silent = false,
    verbose = false,
    noHeadless = false,
    incognito = false,
    watch = false,
    wasmWrap = false,
    wasmBundle = false,
  } = {}
) {
  // console.log('start running function after', performance.now());
  const port = 8100 + Math.floor(900 * Math.random());

  // build JS
  let scriptNameParts = path.basename(scriptPath).split('.');
  scriptNameParts.pop();
  scriptNameParts.push('.js');
  let scriptName = scriptNameParts.join('');
  let bundlePath = path.resolve(cacheDir, scriptName);

  let plugins = [
    subpathImportPlugin,
    inlineWorkerPlugin({
      plugins: [watPlugin({bundle: wasmBundle, wrap: wasmWrap})],
    }),
    watPlugin({bundle: wasmBundle, wrap: wasmWrap}),
  ];

  await esbuild.build({
    bundle: true,
    entryPoints: [scriptPath],
    outfile: bundlePath,
    target: 'esnext',
    format: 'esm',
    plugins,
    watch: watch
      ? {
          onRebuild(error) {
            if (error) console.error('build failed:', error);
            else {
              scriptSource = readFileSync(bundlePath, {encoding: 'utf-8'});
              console.clear();
              console.log(
                '\n' +
                  bold(`Reloading ${scriptName} in watch mode...`) +
                  '\n' +
                  bold(`Press Ctrl-C to stop execution`) +
                  '\n'
              );
              page.reload();
            }
          },
        }
      : false,
  });

  let scriptSource = await readFile(bundlePath, {encoding: 'utf-8'});

  // run dummy/file server
  createServer((req, res) => {
    if (req.url === '/') {
      res.statusCode = 200;
      res.setHeader('content-type', 'text/html');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.end(getHtml(scriptName));
    } else if (req.url === `/${scriptName}`) {
      res.statusCode = 200;
      res.setHeader('content-type', 'text/javascript');
      res.end(scriptSource);
    } else {
      fileServer.serve(req, res);
    }
  }).listen(port);

  // run puppeteer
  let browser = await puppeteer.launch({headless: !noHeadless});
  let context = incognito
    ? await browser.createIncognitoBrowserContext()
    : await browser.defaultBrowserContext();
  let page = await context.newPage();

  if (!silent) {
    page.on('console', msg => {
      // let str = msg
      //   .args()
      //   .map(arg => arg + '')
      //   .join(' ');
      let str = msg.text();
      switch (msg.type()) {
        case 'error':
          console.log(red(str));
          break;
        case 'warning':
          console.log(yellow(str));
          break;
        default:
          console.log(str);
      }
    });
    page.on('pageerror', error => {
      console.log(red.bold(error.message));
      console.log(red(error.stack));
    });
    if (verbose) {
      page.on('response', response => {
        console.log(response.status(), response.url());
      });
    }
    page.on('requestfailed', request => {
      console.log(request.failure().errorText, request.url);
    });
  }
  console.log('\n' + bold(`Press Ctrl-C to stop execution`) + '\n');
  await page.goto(`http://localhost:${port}`);
}

function getHtml(scriptName = 'index.js') {
  return `
<html>
  <head><link rel="icon" href="data:," /></head>
  <body>
    <script type="module" src="/${scriptName}" />
    </script>
  </body>
</html>
`;
}

async function build(scriptPath, extraConfig) {
  let scriptNameParts = path.basename(scriptPath).split('.');
  scriptNameParts.pop();
  scriptNameParts.push('js');
  let scriptName = scriptNameParts.join('.');
  let bundlePath = path.resolve(cacheDir, scriptName);

  let plugins = [
    subpathImportPlugin,
    inlineWorkerPlugin({
      plugins: [watPlugin({bundle: false, wrap: false})],
    }),
    watPlugin({bundle: false, wrap: false}),
  ];

  await esbuild.build({
    bundle: true,
    entryPoints: [scriptPath],
    outfile: bundlePath,
    target: 'esnext',
    format: 'esm',
    plugins,
    ...extraConfig,
  });

  return readFile(bundlePath, {encoding: 'utf-8'});
}
