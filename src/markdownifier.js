var bluebird = require('bluebird');
var marked = bluebird.promisifyAll(require('marked'));
var toc = require('markdown-toc');

function Markdownifier() {}

Markdownifier.prototype.markdownify = function markdownify(content) {
  return new Promise(function (resolve, reject) {
    marked.parseAsync(content)
      .then(function (contentMarked) {
        var markdown = marked(contentMarked);
        var sidebar = marked(toc(content).content);
        resolve({ markdown, sidebar });
      }).catch(function (err) {
        reject(err);
      });
  });
};

Markdownifier.prototype.getToc = function getToc(content) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(toc(content));
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = new Markdownifier();