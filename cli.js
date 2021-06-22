#!/usr/bin/env node
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const run = require('.');

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
    name: 'number',
    alias: 'n',
    type: Number,
    defaultValue: 1,
    description: 'The number of executions.',
  },
  {
    name: 'no-logs',
    type: Boolean,
    defaultValue: false,
    description: 'Do not forward console logs to stdout.',
  },
  {
    name: 'no-incognito',
    type: Boolean,
    defaultValue: false,
    description: 'Do not use an incognito browser context.',
  },
  {
    name: 'no-parallel',
    type: Boolean,
    defaultValue: false,
    description: 'Do not load scripts in parallel.',
  },
  {
    name: 'no-headless',
    type: Boolean,
    defaultValue: false,
    description: 'Open the Chrome browser UI that runs your scripts.',
  },
];

let {
  input,
  number: n,
  help,
  'no-logs': noLogs,
  'no-incognito': noIncognito,
  'no-parallel': noParallel,
  'no-headless': noHeadless,
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
        content: ['chrode {underline script.js} [{bold -n} {underline 2}]'],
      },
      {
        header: 'Options',
        optionList: cliOptions,
      },
    ])
  );
  process.exit(1);
}

run(input, n, {noLogs, noIncognito, noParallel, noHeadless});
