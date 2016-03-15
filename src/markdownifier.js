var marked = require('marked');
var toc = require('markdown-toc');

module.exports.markdownify = function markdownify(content, callback) {
  // Using async version of marked 
  marked(content, function(err, contentMarked) {
    var markdownContent = marked(contentMarked);
    var sideBarContent = marked(toc(content).content);
    callback(markdownContent, sideBarContent);
  });
};
