var fs = require('fs'),
    path = require('path');
var chalk = require('chalk');
var utils = require('./utils');
var spawn = require('child_process').spawn;
var lodashStreamer = require('lodash-template-stream');

module.exports = {
  pandoc: function(sourceFile, callback) {
    console.log(chalk.blue(sourceFile));
    var compile = spawn('pandoc', ['--section', '--no-tex-ligatures', '--normalize', path.join('write/', sourceFile), '-o', path.join('tmp/', utils.mdToTex(sourceFile))]);
    compile.on('close', function(code) {
      if (code !== 0) {
        //console.log(chalk.red(sourceFile, code));
        callback(new Error('pandoc failed with error code ' + code));
      } else {
        //console.log(chalk.green(sourceFile, code));
        callback(null, true);
      }
    });
    compile.stderr.on('data', function (data) {
      console.log('' + data);

    });
  },

  template: function(config) {
    return function(sourceFile, callback) {
      console.log(chalk.blue(sourceFile));
      var out = fs.createWriteStream(path.join('tmp/', sourceFile));
      out.on('finish', callback);
      fs.createReadStream(path.join('template/', sourceFile))
        .pipe(lodashStreamer(config))
        .pipe(out);
    };
  },

  latex: function(sourceFile, callback) {
    console.log(chalk.blue(sourceFile));
    var compile = spawn('xelatex', ['-shell-escape', '-interaction', 'nonstopmode', sourceFile], { cwd: 'tmp/'});
    compile.on('close', function(code) {
      if (code !== 0) {
        callback(new Error('xetex failed with error code ' + code));
      } else {
        callback(null, true);
      }
    });
    compile.stderr.on('data', function (data) {
      console.log('' + data);
    });
  }
}
