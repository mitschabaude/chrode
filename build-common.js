const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function buildCommon(scriptPath, extraConfig) {
  if (!fs.existsSync('/tmp/esbuild'))
    fs.mkdirSync('/tmp/esbuild', {recursive: true});
  let scriptNameParts = path.basename(scriptPath).split('.');
  scriptNameParts.pop();
  scriptNameParts.push('js');
  let scriptName = scriptNameParts.join('.');
  let bundlePath = '/tmp/esbuild/' + scriptName;

  await esbuild.build({
    bundle: true,
    entryPoints: [scriptPath],
    outfile: bundlePath,
    target: 'esnext',
    format: 'esm',
    ...extraConfig,
  });

  return fs.promises.readFile(bundlePath, {encoding: 'utf-8'});
}

module.exports = buildCommon;
