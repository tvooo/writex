var fs = require('fs'),
    path = require('path');
var chalk = require('chalk');
var utils = require('./utils');
var spawn = require('child_process').spawn;
var async = require('async');
var lodashStreamer = require('lodash-template-stream');

module.exports = function(config) {
  return {
    pandoc: function(sourceFile, callback) {
      console.log('...' + chalk.yellow(sourceFile));
      var compile = spawn('pandoc', ['--section', '--no-tex-ligatures', '--normalize', '--biblatex', /*'--filter', 'pandoc-citeproc',*/ path.join(config.contentFolder, sourceFile), '-o', path.join(config.tmpFolder, utils.mdToTex(sourceFile))]);
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
      var out = fs.createWriteStream(path.join(config.tmpFolder, sourceFile));
      out.on('finish', callback);
      fs.createReadStream(path.join(config.templateFolder, sourceFile))
        .pipe(lodashStreamer(config))
        .pipe(out);
    },

    sty: function(sourceFile, callback) {
      console.log('...' + chalk.yellow(sourceFile));
      var out = fs.createWriteStream(path.join(config.tmpFolder, sourceFile));
      out.on('finish', callback);
      fs.createReadStream(path.join('packages/', sourceFile))
        .pipe(out);
    },

    latex: function(sourceFile, callback) {
      console.log('...' + chalk.yellow(sourceFile));
      var compile = spawn(config.engine, ['-shell-escape', '-interaction', 'nonstopmode', sourceFile], { cwd: config.tmpFolder});
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
    },

    bibtex: function(sourceFile, callback) {
      function copyBibliography(cb) {
        console.log('...' + chalk.magenta('cp references.bib'));
        var out = fs.createWriteStream(path.join(config.tmpFolder, 'references.bib'));
        out.on('finish', cb);
        fs.createReadStream(path.join(config.contentFolder, 'references.bib'))
          .pipe(out);
      };
      function latex(cb) {
        console.log('...' + chalk.magenta('LaTeX'));
        var compile = spawn(config.engine, ['-shell-escape', '-interaction', 'nonstopmode', 'template.tex'], { cwd: config.tmpFolder});
        compile.on('close', function(code) {
          cb(null, true);
        });
      };
      function bibtex(cb) {
        console.log('...' + chalk.magenta('BibTeX'));
        var compile = spawn('biber', ['template'], { cwd: config.tmpFolder});
        compile.on('close', function(code) {
          cb(null, true);
        });
      };
      async.series([
        copyBibliography,
        latex,
        bibtex,
        latex,
        latex
      ], function(err) {
        callback(null);
      });
    }
  };
};
