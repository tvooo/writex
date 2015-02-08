var path = require('path'),
    fs   = require('fs');

var async = require('async'),
    chalk = require('chalk'),
    rimraf = require('rimraf');

var utils = require('./utils');

function getContentFiles(config) {
  return fs.readdirSync(config.contentFolder)
    .filter(utils.onlyMarkdown)
    .filter(utils.onlyContent)
    .map(utils.mdToTex);
}

function getTemplateFiles(templateFolder) {
  return fs.readdirSync(templateFolder)
    .filter(utils.onlyTex);
}

function compile(config) {
  // Enrich config
  config.files = getContentFiles(config);
  config.templateFolder = path.dirname(require.resolve(path.join(config.contentFolder, '/node_modules/writex-' + config.template)));;
  config.tmpFolder = path.join(config.contentFolder, '.tmp/');;

  var tasks = require('./tasks')(config);

  async.series([
    function(callback) {
      console.log("Cleaning up...");
      rimraf(config.tmpFolder, callback);
    },

    function(callback) {
      console.log("Preparing...");
      if(!fs.existsSync(config.tmpFolder)) {
        fs.mkdir(config.tmpFolder, callback)
      } else {
        callback(null);
      }
    },

    function(callback) {
      // compile markdown to tex
      console.log("Compiling markdown files...");

      var sourceFiles =
        fs.readdirSync(config.contentFolder)
          .filter(utils.onlyMarkdown)

      async.each(sourceFiles, tasks.pandoc, callback);
    },

    /*function(callback) {
      // copy templates to /tmp
      console.log("Copying LaTeX packages...");

      async.each(['harvard.sty', 'minted.sty'], tasks.sty, callback);
    },*/

    function(callback) {
      // copy templates to /tmp
      console.log("Compiling template files...");

      async.each(getTemplateFiles(config.templateFolder), tasks.template, callback);
    },

    function(callback) {
      // compile latex/bibtex
      console.log("Compiling to PDF using template " + chalk.blue(config.template));

      if(config.bibtex) {
        tasks.bibtex(config.template, callback);
      } else {
        tasks.latex(config.template, callback);
      }
    },

    function(callback) {
      // copy back pdf file to main folder
      console.log("Copying PDF file to output folder");
      if(fs.existsSync(path.join(config.tmpFolder, 'template.pdf'))) {
        var out = fs.createWriteStream(path.join(config.contentFolder, config.document.title + '.pdf'));
        out.on('finish', callback);
        fs.createReadStream(path.join(config.tmpFolder, 'template.pdf'))
          .pipe(out);
      } else {
        callback(new Error("LaTeX didn't produce any output. Check .tmp/template.log for details."));
      }
    }
  ], function(err) {
    if(err) {
      console.error(chalk.red(err));
    }
  });
}

module.exports = {
  compile: compile
};
