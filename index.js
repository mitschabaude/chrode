const puppeteer = require('puppeteer');
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const http = require('http');
const nodeStatic = require('node-static');
const chalk = require('chalk');
const buildCommon = require('./build-common.js');
const watPlugin = require('./esbuild-plugin-wat');
const inlineWorkerPlugin = require('./esbuild-plugin-inline-worker');

const fileServer = new nodeStatic.Server('.');

module.exports = {run, build};

async function run(
  scriptPath,
  {
    silent = false,
    verbose = false,
    noHeadless = false,
    incognito = false,
    watch = false,
  }
) {
  const port = 8100 + Math.floor(900 * Math.random());

  // build JS
  if (!fs.existsSync('/tmp/esbuild'))
    fs.mkdirSync('/tmp/esbuild', {recursive: true});
  let scriptNameParts = path.basename(scriptPath).split('.');
  scriptNameParts.pop();
  scriptNameParts.push('.js');
  let scriptName = scriptNameParts.join('');
  let bundlePath = '/tmp/esbuild/' + scriptName;

  await esbuild.build({
    bundle: true,
    entryPoints: [scriptPath],
    outfile: bundlePath,
    target: 'esnext',
    format: 'esm',
    plugins: [inlineWorkerPlugin({plugins: [watPlugin()]}), watPlugin()],
    watch: watch
      ? {
          onRebuild(error) {
            if (error) console.error('build failed:', error);
            else {
              scriptSource = fs.readFileSync(bundlePath, {encoding: 'utf-8'});
              console.clear();
              console.log(
                '\n' +
                  chalk.bold(`Reloading ${scriptName} in watch mode...`) +
                  '\n' +
                  chalk.bold(`Press Ctrl-C to stop execution`) +
                  '\n'
              );
              page.reload();
            }
          },
        }
      : false,
  });

  let scriptSource = fs.readFileSync(bundlePath, {encoding: 'utf-8'});

  // run dummy/file server
  http
    .createServer((req, res) => {
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
    })
    .listen(port);

  // run puppeteer
  let browser = await puppeteer.launch({headless: !noHeadless});
  let context = incognito
    ? await browser.createIncognitoBrowserContext()
    : await browser.defaultBrowserContext();
  let page = await context.newPage();

  if (!silent) {
    page.on('console', msg => console.log(msg.text()));
    page.on('pageerror', error => {
      console.log(chalk.red.bold(error.message));
      console.log(chalk.red(error.stack));
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
  console.log('\n' + chalk.bold(`Press Ctrl-C to stop execution`) + '\n');
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

function build(scriptPath, extraConfig) {
  return buildCommon(scriptPath, {
    plugins: [inlineWorkerPlugin({plugins: [watPlugin()]}), watPlugin()],
    ...extraConfig,
  });
}
