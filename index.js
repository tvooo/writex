#!/usr/bin/env node

// runtime deps
var fs = require('fs'),
    path = require('path');

// other deps
var chalk = require('chalk'),
    program = require('commander');

// own deps
var utils = require('./src/utils');

process.title = 'writex';

program
  .version('1.0.0')
  .option("-c, --config-file [mode]", "Choose a different configuration file")

program
  .command('watch')
  .description('watch and compile the project in current folder')
  .action(function(template) {
    console.log(chalk.yellow('WARNING: Watching is not yet implemented'));
  });

program
  .command('init <template>')
  .description('run setup commands for all envs')
  .action(function(template) {
    console.log(chalk.yellow('WARNING: Project scaffolding is not yet implemented'));
  });

program
  .command('init-template <name>')
  .description('scaffold a WriTeX template')
  .action(function(name) {
    console.log(chalk.yellow('WARNING: Template scaffolding is not yet implemented'));
  });

program.parse(process.argv);

if (!program.args.length) {
  utils.readConfig(function(err, config) {
    if(err) {
      console.error(chalk.red(err.toString()));
    } else {
      config.contentFolder = process.cwd();
      console.log(config);
      require('./src/lib').compile(config);
    }
  });
}
