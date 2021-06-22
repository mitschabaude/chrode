const puppeteer = require('puppeteer');
const esbuild = require('esbuild');
const fs = require('fs');
const http = require('http');
const nodeStatic = require('node-static');

const fileServer = new nodeStatic.Server('.');

module.exports = run;

async function run(
  path,
  n,
  {noLogs = false, noHeadless = false, noIncognito = false, noParallel = false}
) {
  const port = 8374;

  // build JS
  if (!fs.existsSync('/tmp/esbuild'))
    fs.mkdirSync('/tmp/esbuild', {recursive: true});
  esbuild.buildSync({
    bundle: true,
    entryPoints: [path],
    outfile: '/tmp/esbuild/index.js',
    target: 'es2020',
    format: 'esm',
  });

  // run dummy/file server
  http
    .createServer((req, res) => {
      if (req.url === '/') {
        res.writeHead(200);
        res.end(dummyHtml);
      } else {
        fileServer.serve(req, res);
      }
    })
    .listen(port);

  async function handleContext(context, i) {
    let page = await context.newPage();
    if (!noLogs) {
      page.on(
        'console',
        n > 1
          ? msg => console.log(i, msg.text())
          : msg => console.log(msg.text())
      );
    }

    await page.goto(`http://localhost:${port}`);
    await page.addScriptTag({
      type: 'module',
      path: '/tmp/esbuild/index.js',
    });
  }

  let browser = await puppeteer.launch({headless: !noHeadless});
  let newContext = !noIncognito
    ? () => browser.createIncognitoBrowserContext()
    : () => browser.defaultBrowserContext();
  let contexts = await Promise.all(Array(n).fill(0).map(newContext));
  let promises = [];
  for (let i = 0; i < n; i++) {
    let promise = handleContext(contexts[i], i);
    promises.push(promise);
    if (!noParallel) await promise;
  }
  await Promise.all(promises);
}

const dummyHtml = `<html>
  <head><link rel="icon" href="data:," /></head>
  <body></body>
</html>`;
