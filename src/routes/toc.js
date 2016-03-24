var express = require('express');
var bluebird = require('bluebird');
var markdownify = require('../markdownifier');
var path = require('path');
var fs = bluebird.promisifyAll(require('fs'));
var router = express.Router();

router.get('/:filename', (req, res) => {
  var filename = req.params.filename;
  var serverFilepath = path.resolve(__dirname, path.join('../../', process.env.MARKDOWN_FOLDER, filename + '.md'));

  fs.accessAsync(serverFilepath, fs.F_OK)
    .then(() => {
      return fs.readFileAsync(serverFilepath, "utf8");
    })
    .then((content) => {
      markdownify.getToc(content)
        .then((toc) => { res.json(toc.json); });
    })
    .catch((err) => {
      if (/ENOENT/.test(err)) {
        res.status(404).json('File not found');
      } else {
        res.status(500).json('Internal error while processing the request');
      }
    });
});

module.exports = router;