var fs = require('fs'),
    path = require('path');
var chalk = require('chalk');
var utils = require('./utils');
var spawn = require('child_process').spawn;
var lodashStreamer = require('lodash-template-stream');

module.exports = function(config) {
  return {
    pandoc: function(sourceFile, callback) {
      console.log('...' + chalk.yellow(sourceFile));
      var compile = spawn('pandoc', ['--section', '--no-tex-ligatures', '--normalize', path.join('write/', sourceFile), '-o', path.join('tmp/', utils.mdToTex(sourceFile))]);
      compile.on('close', function(code) {
        if (code !== 0) {
          callback(new Error('pandoc failed with error code ' + code));
        } else {
          callback(null, true);
        }
      });
      compile.stderr.on('data', function (data) {
        console.log('' + data);

      });
    },

    template: function(sourceFile, callback) {
      console.log('...' + chalk.yellow(sourceFile));
      var out = fs.createWriteStream(path.join('tmp/', sourceFile));
      out.on('finish', callback);
      fs.createReadStream(path.join('template/', sourceFile))
        .pipe(lodashStreamer(config))
        .pipe(out);
    },

    latex: function(sourceFile, callback) {
      console.log('...' + chalk.yellow(sourceFile));
      var compile = spawn(config.engine, ['-shell-escape', '-interaction', 'nonstopmode', sourceFile], { cwd: 'tmp/'});
      compile.on('close', function(code) {
        if (code !== 0) {
          callback(new Error(config.engine + ' failed with error code ' + code));
        } else {
          callback(null, true);
        }
      });
      compile.stderr.on('data', function (data) {
        console.log('' + data);
      });
    }
  };
};
