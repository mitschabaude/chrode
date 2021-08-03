#!/usr/bin/env node
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const {build} = require('./index.js');

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
];

let {input, help} = commandLineArgs(cliOptions);
if (help || input === undefined) {
  console.log(
    commandLineUsage([
      {
        header: 'Chrode-build',
        content: 'Build JavaScript/TypeScript with the same config as Chrode.',
      },
      {
        header: 'Usage',
        content: ['chrode-build {underline script.js}'],
      },
      {
        header: 'Options',
        optionList: cliOptions,
      },
    ])
  );
  process.exit(1);
}

build(input).then(script => console.log(script));
