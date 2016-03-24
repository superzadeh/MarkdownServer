var bluebird = require('bluebird');
var marked = bluebird.promisifyAll(require('marked'));
var toc = require('markdown-toc');

function Markdownifier() {}

Markdownifier.prototype.markdownify = (content) => {
  return new Promise((resolve, reject) => {
    marked.parseAsync(content)
      .then((contentMarked) => {
        var markdown = marked(contentMarked);
        var sidebar = marked(toc(content).content);
        resolve({ markdown, sidebar });
      }).catch((err) => {
        reject(err);
      });
  });
};

Markdownifier.prototype.getToc = (content) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(toc(content));
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = new Markdownifier();