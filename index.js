var fs = require('fs'),
    path = require('path');
var chalk = require('chalk');
var async = require('async');
var rimraf = require('rimraf');
//var program = require('commander');


var _ = require('lodash');

var utils = require('./utils');
var tasks = require('./tasks');

var config = JSON.parse(fs.readFileSync('config.json'));

// clean up tmp
rimraf.sync('tmp/');

if(!fs.exists('tmp/')) {
  fs.mkdirSync('tmp/');
}

var contentFiles =
  fs.readdirSync('write/')
    .filter(utils.onlyMarkdown)
    .filter(utils.onlyContent)
    .map(utils.mdToTex);

config.files = contentFiles;

async.series([
  function(callback) {
    // compile markdown to tex
    console.log("Compiling markdown files...");

    var sourceFiles =
      fs.readdirSync('write/')
        .filter(utils.onlyMarkdown)

    async.each(sourceFiles, tasks.pandoc, function(err) {
      if(err) {
        callback(err);
      } else {
        console.log(chalk.green('Done compiling Markdown'));
        callback(null);
      }
    });
  },

  function(callback) {
    // copy templates to /tmp
    console.log("Copying template files...");

    async.each(['paper.tex', '_common.tex'], tasks.template(config), function(err) {
      if(err) {
        console.log(chalk.red('Error while compiling templates'));
        callback(err);
      } else {
        console.log(chalk.green('Done compiling templates'));
        callback(null);
      }
    });
  },

  function(callback) {
    // compile latex
    console.log("Compiling to PDF using template " + chalk.blue(config.template));

    tasks.latex('paper.tex', function(err) {
      if(err) {
        console.error(err);
      } else {
        console.log(chalk.green('Done compiling LaTeX'));
      }
    });
  }
]);

