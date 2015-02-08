var path = require('path'),
    fs   = require('fs');

var chalk = require('chalk'),
    yaml = require('js-yaml');

module.exports = {
  onlyMarkdown: function(filename) {
    return '.md' === path.extname(filename);
  },

  onlyTex: function(filename) {
    return '.tex' === path.extname(filename);
  },

  onlyContent: function(filename) {
    return /^\d+-/.test(filename);
  },

  mdToTex: function(filename) {
    return path.basename(filename, '.md') + '.tex';
  },

  readConfig: function(callback) {
    fs.readFile(path.join(process.cwd(), 'writex.yaml'), function (err, data) {
      if (err) {
        console.log();
        console.log('I could not find a config file (' + chalk.blue('writex.yaml') + ') in this folder.');
        console.log('Try creating one with the following command:');
        console.log();
        console.log('  writex init <template>');
        console.log();
        return callback(err);
      }

      try {
        callback(null, yaml.safeLoad(data));
      } catch(err) {
        callback(err);
      }
    });
  }
}
