var path = require('path'),
    fs   = require('fs');

var async = require('async'),
    chalk = require('chalk'),
    rimraf = require('rimraf'),
    gaze = require('gaze');

var utils = require('./utils');

module.exports = function(config) {
  // Enrich config
  config.files = getContentFiles();
  config.templateFolder = path.dirname(require.resolve(path.join(config.contentFolder, '/node_modules/writex-' + config.template)));
  config.tmpFolder = path.join(config.contentFolder, '.tmp/');

  var tasks = require('./tasks')(config);

  function getContentFiles() {
    return fs.readdirSync(config.contentFolder)
      .filter(utils.onlyMarkdown)
      .filter(utils.onlyContent)
      .map(utils.mdToTex);
  }

  function getTemplateFiles() {
    return fs.readdirSync(config.templateFolder)
      .filter(utils.onlyTex);
  }

  /*
      S T E P S
  */

  function stepCopyPDF(callback) {
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

  function stepLatex(callback) {
    console.log("Compiling to PDF using template " + chalk.blue(config.template));

    if(config.bibtex) {
      tasks.bibtex(config.template, callback);
    } else {
      tasks.latex(config.template, callback);
    }
  }

  function stepTemplate(callback) {
    console.log("Compiling template files...");

    async.each(getTemplateFiles(), tasks.template, callback);
  }

  function stepPandoc(callback) {
    console.log("Compiling markdown files...");

    var sourceFiles =
      fs.readdirSync(config.contentFolder)
        .filter(utils.onlyMarkdown)

    async.each(sourceFiles, tasks.pandoc, callback);
  }

  function stepCreateTmp(callback) {
    console.log("Preparing...");

    if(!fs.existsSync(config.tmpFolder)) {
      fs.mkdir(config.tmpFolder, callback)
    } else {
      callback(null);
    }
  }

  function stepCleanTmp(callback) {
    console.log("Cleaning up...");

    rimraf(config.tmpFolder, callback);
  }

  /*
      W A T C H   C O M M A N D S
  */

  function watchAdded(filepath) {
    // Work around bug: 'added' event fires when file is changed
    if(config.files.indexOf(utils.mdToTex(path.basename(filepath))) > -1 ) {
      // File has already been there...
      return;
    }
    console.log('...' + chalk.green(filepath) + ' was added');
    // Just compile the one md file and recompile latex
    config.files = getContentFiles();
    tasks.updateConfig(config);

    async.series([
      stepPandoc,
      stepTemplate,
      stepLatex,
      stepCopyPDF
    ]);
  }

  function watchDeleted(filepath) {
    console.log('...' + chalk.red(filepath) + ' was deleted');
    // We have to re-do everything, remove whole .tmp dir and compile
    config.files = getContentFiles();
    tasks.updateConfig(config);

    async.series([
      stepCleanTmp,
      stepCreateTmp,
      stepPandoc,
      stepTemplate,
      stepLatex,
      stepCopyPDF
    ]);
  }

  function watchChanged(filepath) {
    console.log('...' + chalk.blue(filepath) + ' was changed');

    if('.md' === path.extname(filepath)) {
      // Just re-compile the one md file and recompile latex
      return async.series([
        stepPandoc,
        stepTemplate,
        stepLatex,
        stepCopyPDF
      ]);
    }
    if('writex.yaml' === path.basename(filepath)) {
      // Recompile templates and recompile latex
      return async.series([
        stepTemplate,
        stepLatex,
        stepCopyPDF
      ]);
    }
  }

  /*
      A P I   C O M M A N D S
  */

  function compile(cleanup, cb) {
    async.series([
      stepCleanTmp,
      stepCreateTmp,
      stepPandoc,
      stepTemplate,
      stepLatex,
      stepCopyPDF
    ], function(err) {
      if(err) {
        return cb(err);
      }
      if(cleanup) {
        return stepCleanTmp(cb);
      }
      cb(err);
    });
  }

  function watch(cb) {
    compile(false, function(err) {
      if(!err) {
        gaze(['**/*.md', '**/writex.yaml'], {cwd: config.contentFolder}, function(err, watcher) {
          console.log("Watching for changes");

          this
            .on('added', watchAdded)
            .on('deleted', watchDeleted)
            .on('changed', watchChanged);
        });
      } else {
        console.error(chalk.red(err));
        console.log();
        console.log('Finished with errors.');
      }
    });
  }

  return {
    compile: compile,
    watch: watch
  }
};
