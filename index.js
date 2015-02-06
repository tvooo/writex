var fs = require('fs'),
    path = require('path');
var chalk = require('chalk');
var async = require('async');
var rimraf = require('rimraf');

var utils = require('./utils');

var config = JSON.parse(fs.readFileSync('config.json'));

// collect content md files and inject into config
var contentFiles =
  fs.readdirSync('write/')
    .filter(utils.onlyMarkdown)
    .filter(utils.onlyContent)
    .map(utils.mdToTex);

config.files = contentFiles;

var tasks = require('./tasks')(config);

async.series([
  function(callback) {
    console.log("Cleaning up...");
    rimraf('tmp/', callback);
  },

  function(callback) {
    console.log("Preparing...");
    if(!fs.exists('tmp/')) {
      fs.mkdir('tmp/', callback)
    } else {
      callback(null);
    }
  },

  function(callback) {
    // compile markdown to tex
    console.log("Compiling markdown files...");

    var sourceFiles =
      fs.readdirSync('write/')
        .filter(utils.onlyMarkdown)

    async.each(sourceFiles, tasks.pandoc, callback);
  },

  function(callback) {
    // copy templates to /tmp
    console.log("Compiling template files...");

    async.each([config.template, '_common.tex'], tasks.template, callback);
  },

  function(callback) {
    // compile latex
    console.log("Compiling to PDF using template " + chalk.blue(config.template));

    tasks.latex(config.template, callback);
  }
], function(err) {
  if(err) {
    console.error(chalk.red(err));
  }
});

