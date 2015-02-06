var path = require('path');

module.exports = {
  onlyMarkdown: function(filename) {
    return '.md' === path.extname(filename);
  },

  onlyContent: function(filename) {
    return /^\d+-/.test(filename);
  },

  mdToTex: function(filename) {
    return path.basename(filename, '.md') + '.tex';
  }
}
