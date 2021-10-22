#!/usr/bin/env node
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import {run} from './index.js';

const cliOptions = [
  {
    name: 'input',
    type: String,
    defaultOption: true,
    description: 'The JS/TS file to process.',
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    defaultValue: false,
    description: 'Print this information.',
  },
  {
    name: 'watch',
    alias: 'w',
    type: Boolean,
    defaultOption: false,
    description: 'Re-execute on file changes',
  },
  {
    name: 'silent',
    alias: 's',
    type: Boolean,
    defaultValue: false,
    description: 'Do not forward any console logs to stdout.',
  },
  {
    name: 'verbose',
    alias: 'v',
    type: Boolean,
    defaultValue: false,
    description:
      'Forward additional console events to stdout, like fetch results.',
  },
  {
    name: 'incognito',
    type: Boolean,
    defaultValue: false,
    description: 'Use an incognito browser context.',
  },
  {
    name: 'no-headless',
    type: Boolean,
    defaultValue: false,
    description: 'Open the Chrome browser UI that runs your scripts.',
  },
  // {
  //   name: 'wasm-wrap',
  //   type: Boolean,
  //   defaultValue: false,
  //   description: 'Wrap Wasm imports.',
  // },
  // {
  //   name: 'wasm-bundle',
  //   type: Boolean,
  //   defaultValue: false,
  //   description: "Bundle Wasm.",
  // },
];

let {
  input,
  help,
  watch,
  incognito,
  silent,
  verbose,
  'no-headless': noHeadless,
  'wasm-wrap': wasmWrap,
  'wasm-bundle': wasmBundle,
} = commandLineArgs(cliOptions);
if (help || input === undefined) {
  console.log(
    commandLineUsage([
      {
        header: 'Chrode',
        content: 'Run JavaScript in Chrome, from the command line.',
      },
      {
        header: 'Usage',
        content: ['chrode {underline script.js} [--watch]'],
      },
      {
        header: 'Options',
        optionList: cliOptions,
      },
    ])
  );
  process.exit(1);
}

run(input, {
  incognito,
  watch,
  silent,
  verbose,
  noHeadless,
  wasmWrap,
  wasmBundle,
});
