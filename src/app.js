var express = require('express');
var path = require('path');
var os = require('os');
var errorHandler = require('errorhandler');
var fs = require('fs');
var request = require('request');
var logger = require('morgan');
var constants = require('./constants');
var markdownifier = require('./markdownifier');
var app = express();

// all environments
app.set(constants.PORT, process.env.PORT || 3000);
app.set('views', path.resolve(__dirname, '../views'));
app.set('view engine', 'jade');
app.use(express.static(path.resolve(__dirname, '../public')));
app.set(constants.MARKDOWN_FOLDER, process.env.MARKDOWN_FOLDER || '../markdown/');

// development only
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
  app.set(constants.HOST, 'http://localhost');
  app.use(logger('dev'));
}

// Load from local files
app.get('/:filename', function(req, res) {
  var filename = req.params.filename;
  var serverFilepath = path.resolve(__dirname, app.get(constants.MARKDOWN_FOLDER) + filename + '.md');
  fs.access(serverFilepath, fs.F_OK, function(err) {
    if (!err) {
      var content = fs.readFileSync(serverFilepath, "utf8");
      new markdownifier().markdownify(content, function(markdownContent, sideBarContent) {
        res.render('markdown', { markdown: markdownContent, sidebar: sideBarContent });
      });
    } else {
      // reply 200 to still render a page, but indicate that the file was not found
      res.status(200).send('File not found: ' + filename);
    }
  });
});

// Load from external URLs
app.get('/fromurl/:url', function(req, res) {
  var response = request(req.params.url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      new markdownifier().markdownify(body, function(markdownContent, sideBarContent) {
        res.render('markdown', { markdown: markdownContent, sidebar: sideBarContent });
      });
    } else {
      res.status(200).send('Not found: ' + req.params.url);
    }
  });
});

module.exports = app;