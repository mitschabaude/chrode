/* eslint-env node */
const buildCommon = require('./build-common.js');

const inlineWorkerFunctionCode = `
export default function inlineWorker(scriptText) {
  let blob = new Blob([scriptText], {type: 'text/javascript'});
  let url = URL.createObjectURL(blob);
  let worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}
`;

const inlineWorkerPlugin = extraConfig => ({
  name: 'esbuild-plugin-inline-worker',

  setup(build) {
    build.onLoad({filter: /.worker.js$/}, async ({path: workerPath}) => {
      // let workerCode = await fs.promises.readFile(workerPath, {
      //   encoding: 'utf-8',
      // });

      let workerCode = await buildCommon(workerPath, {
        minify: true,
        ...extraConfig,
      });
      return {
        contents: `import inlineWorker from '__inline-worker'
        export default function Worker() {
          return inlineWorker(${JSON.stringify(workerCode)});
        }
        `,
        loader: 'js',
      };
    });

    build.onResolve({filter: /^__inline-worker$/}, ({path}) => {
      return {path, namespace: 'inline-worker'};
    });
    build.onLoad({filter: /.*/, namespace: 'inline-worker'}, () => {
      return {contents: inlineWorkerFunctionCode, loader: 'js'};
    });
  },
});

module.exports = inlineWorkerPlugin;
