// core dependencies
var express = require('express');
var path = require('path');
var errorHandler = require('errorhandler');
var logger = require('morgan');
// modules
var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var markdownifier = require('./markdownifier');
var constants = require('./constants');
// routes
var external = require('./routes/external');
var toc = require('./routes/toc');

var app = express();

// all environments
app.set('views', path.resolve(__dirname, '../views'));
app.set('view engine', 'jade');
app.use(express.static(path.resolve(__dirname, '../public')));

// Configuration
// TODO: refactor with nconf
app.set(constants.PORT, process.env.PORT || 3000);
app.set(constants.MARKDOWN_FOLDER, process.env.MARKDOWN_FOLDER || './markdown/');
process.env.MARKDOWN_FOLDER = process.env.MARKDOWN_FOLDER ? process.env.MARKDOWN_FOLDER : './markdown/';

// development only
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
  app.set(constants.HOST, 'http://localhost');
  app.use(logger('dev'));
}

// Load from local files
app.get('/:filename', function (req, res) {
  var filename = req.params.filename;
  var serverFilepath = path.resolve(__dirname, app.get(constants.MARKDOWN_FOLDER) + filename + '.md');
  fs.accessAsync(serverFilepath, fs.F_OK)
    .then(function () {
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

app.use("/external", external);
app.use("/toc", toc);

module.exports = app;