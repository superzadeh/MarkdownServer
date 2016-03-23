var express = require('express');
var path = require('path');
var bluebird = require('bluebird');
var markdownifier = require('../markdownifier');
var fs = bluebird.promisifyAll(require('fs'));
var router = express.Router();

// Load from local files
router.get('/:filename', function (req, res) {
  var filename = req.params.filename;
  var serverFilepath = path.resolve(__dirname, '../', process.env.MARKDOWN_FOLDER, filename + '.md ');
  fs.accessAsync(serverFilepath, fs.R_OK)
    .then(function (result) {
      console.log(result);
      return fs.readFileAsync(serverFilepath, "utf8");
    })
    .then(function (content) {
      return markdownifier.markdownify(content).then(function (data) {
        res.render('markdown', { markdown: data.markdown, sidebar: data.sidebar });
      });
    })
    .catch(function (err) {
      res.status(200).send(`Error while processing the request, ${err}`);
    });
});

module.exports = router;